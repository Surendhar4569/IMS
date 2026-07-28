import { pool } from '../config/database.js';
// Get closed incidents for PCA
export const getClosedIncidents = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.id, i.incident_code, i.incident_title, i.incident_type, i.severity_level, 
             i.incident_status, i.location_details, i.description, i.created_at, i.updated_at,
             i.reported_by,
             CONCAT(e.first_name, ' ', e.last_name) AS reported_by_name
             FROM incidents i
             LEFT JOIN employees e ON i.reported_by = e.id
             WHERE i.incident_status = $1 
             ORDER BY i.updated_at DESC`,
            ['CLOSED']
        );
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching closed incidents:', error);
        res.status(500).json({ message: 'Failed to fetch closed incidents' });
    }
};

// Create post-incident review
export const createPostIncidentReview = async (req, res) => {
    try {
        const {
            incident_id,
            contributing_factors,
            rca,
            what_went_well,
            what_went_wrong,
            lessons_learned,
            executive_summary,
            recommendations,
            action_items,
            created_by
        } = req.body;

        const result = await pool.query(
            `INSERT INTO post_incident_reviews 
             (incident_id, contributing_factors, rca, what_went_well, what_went_wrong, 
              lessons_learned, executive_summary, recommendations, action_items, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                incident_id,
                contributing_factors || null,
                rca || null,
                what_went_well || null,
                what_went_wrong || null,
                lessons_learned || null,
                executive_summary || null,
                recommendations || null,
                JSON.stringify(action_items || []),
                created_by || null
            ]
        );

        res.json({ data: result.rows[0], message: 'Post-incident review created successfully' });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Failed to create post-incident review' });
    }
};

// Get all post-incident reviews
export const getPostIncidentReviews = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pir.*, i.incident_code, i.incident_title, i.incident_type, i.severity_level, i.location_details
             FROM post_incident_reviews pir
             LEFT JOIN incidents i ON pir.incident_id = i.id
             ORDER BY pir.created_at DESC`
        );
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

// Get single review by ID
export const getPostIncidentReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT pir.*, i.incident_code, i.incident_title, i.incident_type, i.severity_level, 
             i.location_details, i.description, i.reported_by_name, i.created_at as incident_created_at, i.resolved_at
             FROM post_incident_reviews pir
             LEFT JOIN incidents i ON pir.incident_id = i.id
             WHERE pir.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ message: 'Failed to fetch review' });
    }
};

// Update review
export const updatePostIncidentReview = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            contributing_factors,
            rca,
            what_went_well,
            what_went_wrong,
            lessons_learned,
            executive_summary,
            recommendations,
            action_items
        } = req.body;

        const result = await pool.query(
            `UPDATE post_incident_reviews SET
             contributing_factors = COALESCE($2, contributing_factors),
             rca = COALESCE($3, rca),
             what_went_well = COALESCE($4, what_went_well),
             what_went_wrong = COALESCE($5, what_went_wrong),
             lessons_learned = COALESCE($6, lessons_learned),
             executive_summary = COALESCE($7, executive_summary),
             recommendations = COALESCE($8, recommendations),
             action_items = COALESCE($9, action_items),
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [
                id,
                contributing_factors || null,
                rca || null,
                what_went_well || null,
                what_went_wrong || null,
                lessons_learned || null,
                executive_summary || null,
                recommendations || null,
                JSON.stringify(action_items || [])
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json({ data: result.rows[0], message: 'Review updated successfully' });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Failed to update review' });
    }
};