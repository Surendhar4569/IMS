import { pool } from '../config/database.js';
import { getExternalToken } from "../utils/getExternalToken.js";
import bcrypt from 'bcrypt';
import https from "https";
import axios from "axios";
const DEFAULT_PASSWORD = 'vgt@123';
const SALT_ROUNDS = 10;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Helper function to hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Helper function to format employee data for response
const formatEmployeeResponse = (employee) => {
  return {
    id: employee.id,
    role_id: employee.role_id,
    first_name: employee.first_name,
    last_name: employee.last_name,
    contact_number: employee.contact_number,
    email: employee.email,
    address: employee.address ?? employee.adress ?? null,
    join_date: employee.join_date,
    is_active: employee.is_active,
    created_at: employee.created_at,
    updated_at: employee.updated_at,
    role_name: employee.role_name,
    full_name: `${employee.first_name} ${employee.last_name}`
  };
};

// CREATE - Register new employee 


export const registerEmployee = async (req, res) => {
  const client = await pool.connect();

  try {
    const payload = req.body.payload;
    const emsPayload = req.body.emsPayload;

    const { user_id, salt } = req.query;

    if (!payload) {
      return res.status(400).json({
        success: false,
        message: 'Employee payload is required'
      });
    }

    if (!emsPayload) {
      return res.status(400).json({
        success: false,
        message: 'EMS payload is required'
      });
    }

    const {
      role_id,
      first_name,
      last_name,
      contact_number,
      email,
      password,
      is_active = true
    } = payload;


    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'First name, last name, email, and password are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }


    await client.query('BEGIN');

    const query = `
      INSERT INTO employees (
        role_id,
        first_name,
        last_name,
        contact_number,
        email,
        password,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING
        id,
        role_id,
        first_name,
        last_name,
        contact_number,
        email,
        is_active,
        created_at,
        updated_at
    `;

    const values = [
      role_id || null,
      first_name.trim(),
      last_name.trim(),
      contact_number || null,
      email.toLowerCase().trim(),
      password,
      is_active
    ];

    const result = await client.query(query, values);

    const employee = result.rows[0];


    try {

      const token = await getExternalToken(user_id, salt);
      console.log(emsPayload);
      const emsResponse = await axios.post(
        `${process.env.VOICEGATE_URL}/members/`,
        emsPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          httpsAgent
        }
      );

      const emsData = emsResponse.data;

      console.log(
        'EMS Response:',
        JSON.stringify(emsData, null, 2)
      );

      const emsMember = emsData?.members?.[0];

      if (!emsMember) {
        throw new Error('EMS member data not returned after registration');
      }

      console.log('EMS Member:', emsMember);

      await client.query(
        `
    UPDATE employees
    SET
      member_code = $1,
      member_id = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `,
        [
          emsMember.member_code || null,
          emsMember.id || null,
          employee.id
        ]
      );

      if (
        emsData?.error_response?.error_code !== 0
      ) {
        const errorMessage =
          emsData?.error_response?.error_message ||
          'EMS registration failed';

        throw new Error(errorMessage);
      }


    } catch (emsError) {

      let errorMessage = 'EMS registration failed';

      if (axios.isAxiosError(emsError)) {

        console.error(
          'EMS API HTTP Status:',
          emsError.response?.status
        );

        console.error(
          'EMS API Error Response:',
          emsError.response?.data
        );

        const errorResponse =
          emsError.response?.data?.error_response;

        errorMessage =
          errorResponse?.error_message ||
          emsError.response?.data?.message ||
          emsError.message ||
          'EMS API request failed';

      } else {

        errorMessage =
          emsError.message ||
          'EMS registration failed';
      }

      console.error(
        'EMS Error Message:',
        errorMessage
      );

      await client.query('ROLLBACK');

      console.log(
        'Local DB transaction rolled back'
      );

      return res.status(502).json({
        success: false,
        message: 'Employee registration failed in EMS',
        error: errorMessage
      });
    }

    await client.query('COMMIT');


    const employeeWithRole =
      await getEmployeeWithRole(employee.id);

    return res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: formatEmployeeResponse(employeeWithRole)
    });

  } catch (error) {

    try {
      await client.query('ROLLBACK');


    } catch (rollbackError) {

      console.error(
        'Rollback error:',
        rollbackError
      );
    }

    console.error(
      'Employee registration error:',
      error
    );

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Employee registration failed',
      error: error.message
    });

  } finally {

    client.release();
  }
};

// Helper to get employee with role name
const getEmployeeWithRole = async (id) => {
  const query = `
    SELECT e.*, r.name as role_name
    FROM employees e
    LEFT JOIN Roles r ON e.role_id = r.id
    WHERE e.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// READ - Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const {
      is_active,
      search,
      role_id
    } = req.query;

    let query = `
      SELECT 
        e.id,
        e.role_id,
        e.first_name,
        e.last_name,
        e.contact_number,
        e.email,
        e.is_active,
        e.created_at,
        e.updated_at,
        e.member_id,
        e.member_code,
        r.name AS role_name
      FROM employees e
      LEFT JOIN Roles r ON e.role_id = r.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filter by active status
    if (is_active !== undefined) {
      query += ` AND e.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    // Filter by role
    if (role_id) {
      query += ` AND e.role_id = $${paramIndex}`;
      params.push(role_id);
      paramIndex++;
    }

    // Search by name or email
    if (search) {
      query += `
        AND (
          e.first_name ILIKE $${paramIndex}
          OR e.last_name ILIKE $${paramIndex}
          OR e.email ILIKE $${paramIndex}
          OR CONCAT(e.first_name, ' ', e.last_name) ILIKE $${paramIndex}
        )
      `;

      params.push(`%${search}%`);
      paramIndex++;
    }

    // Sort latest employees first
    query += ` ORDER BY e.created_at DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(emp => formatEmployeeResponse(emp))
    });

  } catch (error) {
    console.error('Error fetching employees:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// export const getAllEmployees = async (req, res) => {
//   try {
//     const {
//       is_active,
//       search,
//       role_id,
//       user_id,
//       salt
//     } = req.query;

//     // =========================================================
//     // 1. FETCH EMPLOYEES FROM LOCAL DATABASE
//     // =========================================================

//     let query = `
//       SELECT
//         e.id,
//         e.role_id,
//         e.first_name,
//         e.last_name,
//         e.contact_number,
//         e.email,
//         e.member_code,
//         e.member_id,
//         e.is_active,
//         e.created_at,
//         e.updated_at,
//         r.name AS role_name
//       FROM employees e
//       LEFT JOIN Roles r ON e.role_id = r.id
//       WHERE 1 = 1
//     `;

//     const params = [];
//     let paramIndex = 1;

//     // Filter by active status
//     if (is_active !== undefined) {
//       query += ` AND e.is_active = $${paramIndex}`;

//       params.push(is_active === 'true');
//       paramIndex++;
//     }

//     // Filter by role
//     if (role_id) {
//       query += ` AND e.role_id = $${paramIndex}`;

//       params.push(role_id);
//       paramIndex++;
//     }

//     // Search
//     if (search) {
//       query += `
//         AND (
//           e.first_name ILIKE $${paramIndex}
//           OR e.last_name ILIKE $${paramIndex}
//           OR e.email ILIKE $${paramIndex}
//           OR e.member_code ILIKE $${paramIndex}
//           OR e.member_id ILIKE $${paramIndex}
//           OR CONCAT(e.first_name, ' ', e.last_name)
//              ILIKE $${paramIndex}
//         )
//       `;

//       params.push(`%${search}%`);
//       paramIndex++;
//     }

//     query += `
//       ORDER BY e.created_at DESC
//     `;

//     const localResult = await pool.query(
//       query,
//       params
//     );

//     const localEmployees = localResult.rows;

//     console.log(
//       'Local employees count:',
//       localEmployees.length
//     );

//     // =========================================================
//     // 2. FETCH MEMBERS FROM EMS
//     // =========================================================

//     let emsMembers = [];

//     try {
//       const token = await getExternalToken(user_id,salt);

//       const emsResponse = await axios.get(
//         `${process.env.VOICEGATE_URL}/members/`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           httpsAgent
//         }
//       );

//       console.log(
//         'EMS API status:',
//         emsResponse.status
//       );

//       console.log(
//         'EMS API response:',
//         emsResponse.data
//       );

//       const emsData = emsResponse.data;

//       // Check EMS business response
//       if (
//         emsData?.error_response?.error_code !== 0
//       ) {
//         throw new Error(
//           emsData?.error_response?.error_message ||
//           'Failed to fetch EMS members'
//         );
//       }

//       emsMembers = emsData?.members || [];

//       console.log(
//         'EMS members count:',
//         emsMembers.length
//       );

//     } catch (emsError) {

//       console.error(
//         'EMS API error:',
//         emsError.response?.data ||
//         emsError.message
//       );

//       let errorMessage =
//         'Failed to fetch members from EMS';

//       if (axios.isAxiosError(emsError)) {
//         errorMessage =
//           emsError.response?.data
//             ?.error_response
//             ?.error_message ||
//           emsError.response?.data?.message ||
//           emsError.message ||
//           errorMessage;
//       } else {
//         errorMessage =
//           emsError.message ||
//           errorMessage;
//       }

//       return res.status(502).json({
//         success: false,
//         message: 'Failed to fetch employees from EMS',
//         error: errorMessage
//       });
//     }

//     // =========================================================
//     // 3. CREATE MAP
//     // =========================================================

//     const employeeMap = new Map();

//     // =========================================================
//     // 4. ADD LOCAL EMPLOYEES
//     // =========================================================

//     localEmployees.forEach((employee) => {

//       /*
//        * member_code is the primary matching key.
//        */

//       const key = employee.member_code
//         ? `code:${employee.member_code}`
//         : employee.member_id
//           ? `member:${employee.member_id}`
//           : `local:${employee.id}`;

//       employeeMap.set(key, {

//         source: 'local',

//         local_id: employee.id,

//         member_id:
//           employee.member_id || null,

//         member_code:
//           employee.member_code || null,

//         role_id:
//           employee.role_id || null,

//         role_name:
//           employee.role_name || null,

//         first_name:
//           employee.first_name || '',

//         last_name:
//           employee.last_name || '',

//         displayName:
//           `${employee.first_name || ''} ${employee.last_name || ''}`
//             .trim(),

//         contact_number:
//           employee.contact_number || null,

//         email:
//           employee.email || null,

//         is_active:
//           employee.is_active,

//         gender: null,

//         dob: null,

//         preferredLanguage: null,

//         timezone: null,

//         created_at:
//           employee.created_at || null,

//         updated_at:
//           employee.updated_at || null,

//         ems_createdat: null,

//         ems_updateat: null,

//         ems_synced: false
//       });
//     });

//     // =========================================================
//     // 5. MERGE EMS MEMBERS
//     // =========================================================

//     emsMembers.forEach((member) => {

//       /*
//        * Match EMS with Local using member_code.
//        */

//       const key = member.member_code
//         ? `code:${member.member_code}`
//         : `member:${member.id}`;

//       const existingEmployee =
//         employeeMap.get(key);

//       // =======================================================
//       // EXISTS IN BOTH LOCAL + EMS
//       // =======================================================

//       if (existingEmployee) {

//         employeeMap.set(key, {

//           ...existingEmployee,

//           source: 'local_and_ems',

//           local_id:
//             existingEmployee.local_id,

//           // EMS member ID
//           member_id:
//             member.id ||
//             existingEmployee.member_id,

//           member_code:
//             member.member_code ||
//             existingEmployee.member_code,

//           role_id:
//             existingEmployee.role_id,

//           role_name:
//             existingEmployee.role_name,

//           first_name:
//             member.first_name ||
//             existingEmployee.first_name,

//           last_name:
//             member.last_name ||
//             existingEmployee.last_name,

//           displayName:
//             member.displayName ||
//             existingEmployee.displayName,

//           gender:
//             member.gender || null,

//           dob:
//             member.dob || null,

//           preferredLanguage:
//             member.preferredLanguage || null,

//           timezone:
//             member.timezone || null,

//           ems_createdat:
//             member.createdat || null,

//           ems_updateat:
//             member.updateat || null,

//           ems_synced: true
//         });

//       } else {

//         // =====================================================
//         // EXISTS ONLY IN EMS
//         // =====================================================

//         employeeMap.set(key, {

//           source: 'ems',

//           local_id: null,

//           member_id:
//             member.id || null,

//           member_code:
//             member.member_code || null,

//           role_id: null,

//           role_name: null,

//           first_name:
//             member.first_name || '',

//           last_name:
//             member.last_name || '',

//           displayName:
//             member.displayName ||
//             `${member.first_name || ''} ${member.last_name || ''}`
//               .trim(),

//           contact_number: null,

//           email:
//             member.email || null,

//           is_active:
//             member.status === 'active',

//           gender:
//             member.gender || null,

//           dob:
//             member.dob || null,

//           preferredLanguage:
//             member.preferredLanguage || null,

//           timezone:
//             member.timezone || null,

//           created_at:
//             member.createdat || null,

//           updated_at:
//             member.updateat || null,

//           ems_createdat:
//             member.createdat || null,

//           ems_updateat:
//             member.updateat || null,

//           ems_synced: true
//         });
//       }
//     });

//     // =========================================================
//     // 6. CONVERT MAP TO ARRAY
//     // =========================================================

//     let employees = Array.from(
//       employeeMap.values()
//     );

//     // =========================================================
//     // 7. SEARCH FINAL MERGED DATA
//     // =========================================================

//     if (search) {

//       const searchValue =
//         search.trim().toLowerCase();

//       employees = employees.filter(
//         (employee) => {

//           return (
//             employee.first_name
//               ?.toLowerCase()
//               .includes(searchValue) ||

//             employee.last_name
//               ?.toLowerCase()
//               .includes(searchValue) ||

//             employee.displayName
//               ?.toLowerCase()
//               .includes(searchValue) ||

//             employee.email
//               ?.toLowerCase()
//               .includes(searchValue) ||

//             employee.member_code
//               ?.toLowerCase()
//               .includes(searchValue) ||

//             employee.member_id
//               ?.toLowerCase()
//               .includes(searchValue)
//           );
//         }
//       );
//     }

//     // =========================================================
//     // 8. ACTIVE FILTER
//     // =========================================================

//     if (is_active !== undefined) {

//       const activeValue =
//         is_active === 'true';

//       employees = employees.filter(
//         (employee) =>
//           employee.is_active === activeValue
//       );
//     }

//     // =========================================================
//     // 9. ROLE FILTER
//     // =========================================================

//     if (role_id) {

//       employees = employees.filter(
//         (employee) =>
//           String(employee.role_id) ===
//           String(role_id)
//       );
//     }

//     // =========================================================
//     // 10. FINAL RESPONSE
//     // =========================================================

//     console.log(
//       'Final merged employees:',
//       employees
//     );

//     return res.status(200).json({
//       success: true,

//       count: employees.length,

//       local_count:
//         localEmployees.length,

//       ems_count:
//         emsMembers.length,

//       data: employees
//     });

//   } catch (error) {

//     console.error(
//       'Error fetching employees:',
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// READ - Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await getEmployeeWithRole(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: formatEmployeeResponse(employee)
    });

  } catch (error) {
    console.error('Error fetching employee:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// UPDATE - Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      role_id,
      first_name,
      last_name,
      contact_number,
      email,
      is_active
    } = req.body;

    // Check if employee exists
    const checkQuery = `
      SELECT id 
      FROM employees 
      WHERE id = $1
    `;

    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    // Role
    if (role_id !== undefined) {
      updates.push(`role_id = $${paramIndex}`);
      params.push(role_id || null);
      paramIndex++;
    }

    // First Name
    if (first_name !== undefined && first_name.trim() !== '') {
      updates.push(`first_name = $${paramIndex}`);
      params.push(first_name.trim());
      paramIndex++;
    }

    // Last Name
    if (last_name !== undefined && last_name.trim() !== '') {
      updates.push(`last_name = $${paramIndex}`);
      params.push(last_name.trim());
      paramIndex++;
    }

    // Contact Number
    if (contact_number !== undefined) {
      updates.push(`contact_number = $${paramIndex}`);
      params.push(contact_number || null);
      paramIndex++;
    }

    // Email
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      updates.push(`email = $${paramIndex}`);
      params.push(email.toLowerCase().trim());
      paramIndex++;
    }

    // Active Status
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    // No fields to update
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Always update updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE employees
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        role_id,
        first_name,
        last_name,
        contact_number,
        email,
        is_active,
        created_at,
        updated_at
    `;

    params.push(id);

    const result = await pool.query(query, params);

    // Get employee with role information
    const updatedEmployee = await getEmployeeWithRole(result.rows[0].id);

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: formatEmployeeResponse(updatedEmployee)
    });

  } catch (error) {

    // Duplicate email
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    console.error('Error updating employee:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// DELETE - Hard delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const checkQuery = 'SELECT id, first_name, last_name FROM employees WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const query = 'DELETE FROM employees WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);

    res.status(200).json({
      success: true,
      message: `Employee ${checkResult.rows[0].first_name} ${checkResult.rows[0].last_name} deleted successfully`,
      data: { id: result.rows[0]?.id }
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// SOFT DELETE - Deactivate employee
export const deactivateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE employees 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or already inactive'
      });
    }

    const employee = await getEmployeeWithRole(id);

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
      data: formatEmployeeResponse(employee)
    });
  } catch (error) {
    console.error('Error deactivating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ACTIVATE - Activate employee
export const activateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE employees 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = false
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or already active'
      });
    }

    const employee = await getEmployeeWithRole(id);

    res.status(200).json({
      success: true,
      message: 'Employee activated successfully',
      data: formatEmployeeResponse(employee)
    });
  } catch (error) {
    console.error('Error activating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// RESET PASSWORD - Reset employee password to default
export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const checkQuery = 'SELECT id, first_name, last_name FROM employees WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

    const query = `
      UPDATE employees 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;

    await pool.query(query, [hashedPassword, id]);

    res.status(200).json({
      success: true,
      message: `Password reset to default: ${DEFAULT_PASSWORD}`,
      data: {
        id: parseInt(id),
        default_password: DEFAULT_PASSWORD
      }
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// CHANGE PASSWORD - Change employee password
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current password hash
    const getPasswordQuery = 'SELECT password FROM employees WHERE id = $1';
    const passwordResult = await pool.query(getPasswordQuery, [id]);

    if (passwordResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      current_password,
      passwordResult.rows[0].password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(new_password);

    const query = `
      UPDATE employees 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await pool.query(query, [hashedNewPassword, id]);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get employees by role
export const getEmployeesByRole = async (req, res) => {
  try {
    const { role_id } = req.params;

    const query = `
      SELECT e.*, r.name as role_name
      FROM employees e
      LEFT JOIN Roles r ON e.role_id = r.id
      WHERE e.role_id = $1
      ORDER BY e.first_name, e.last_name
    `;

    const result = await pool.query(query, [role_id]);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(emp => formatEmployeeResponse(emp))
    });
  } catch (error) {
    console.error('Error fetching employees by role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get employee statistics
export const getEmployeeStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_employees,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_employees,
        COUNT(DISTINCT role_id) as roles_occupied,
        COUNT(CASE WHEN join_date >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as joined_this_month
      FROM employees
    `;

    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};