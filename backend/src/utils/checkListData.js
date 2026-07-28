// export const checklistData = [
//   {
//     id: "sec1",
//     title: "1. Terminal Sprinkler System Inspection",
//     items: [
//       {
//         id: "1-1",
//         text: "Sprinkler Head Visual Condition and Coverage Verification",
//       },
//       {
//         id: "1-2",
//         text: "Control Valve Position and Tamper Switch Status Check",
//       },
//       {
//         id: "1-3",
//         text: "Water Flow Alarm and Inspector's Test Connection Verification",
//       },
//       {
//         id: "1-4",
//         text: "Dry Pipe and Pre-Action System Air Pressure Inspection",
//       },
//     ],
//   },
//   {
//     id: "sec2",
//     title: "2. Hangar Foam Suppression System Inspection",
//     items: [
//       { id: "2-1", text: "Foam Concentrate Level and Quality Verification" },
//       {
//         id: "2-2",
//         text: "Foam Proportioner Calibration and Flow Rate Testing",
//       },
//       {
//         id: "2-3",
//         text: "Overhead Foam Discharge Nozzle and Deflector Inspection",
//       },
//       {
//         id: "2-4",
//         text: "Hangar Door Interlocks and Drainage System Functionality Check",
//       },
//     ],
//   },
//   {
//     id: "sec3",
//     title: "3. Fuel Farm Fire Suppression and Detection Inspection",
//     items: [
//       {
//         id: "3-1",
//         text: "Fixed Fuel Farm Foam/Water Deluge System Readiness Check",
//       },
//       {
//         id: "3-2",
//         text: "Flammable Vapor and Flame Detector Functional Testing",
//       },
//       {
//         id: "3-3",
//         text: "Dike Wall Integrity and Containment Area Drainage Inspection",
//       },
//     ],
//   },
//   {
//     id: "sec4",
//     title: "4. Airport Fire Alarm System Inspection",
//     items: [
//       {
//         id: "4-1",
//         text: "Fire Alarm Control Panel Status and Trouble Signal Review",
//       },
//       { id: "4-2", text: "Smoke and Heat Detector Sensitivity Testing" },
//       {
//         id: "4-3",
//         text: "Manual Pull Station and Notification Appliance Circuit Test",
//       },
//       {
//         id: "4-4",
//         text: "Central Monitoring Station Signal Transmission Verification",
//       },
//     ],
//   },
//   {
//     id: "sec5",
//     title: "5. Fire Pump Inspection and Performance Testing",
//     items: [
//       { id: "5-1", text: "Weekly Fire Pump Automatic Start and Run Test" },
//       {
//         id: "5-2",
//         text: "Annual Flow Test at Rated Capacity and Overload Point",
//       },
//       {
//         id: "5-3",
//         text: "Diesel Engine Fire Pump Fuel Level and Battery Condition Check",
//       },
//     ],
//   },
//   {
//     id: "sec6",
//     title: "6. Fire Extinguisher and Standpipe Hose System Inspection",
//     items: [
//       {
//         id: "6-1",
//         text: "Portable Fire Extinguisher Monthly Inspection and Tag Update",
//       },
//       {
//         id: "6-2",
//         text: "Class D and Specialized Aviation Extinguisher Availability Verification",
//       },
//       {
//         id: "6-3",
//         text: "Standpipe Hose Cabinet Hose Condition and Valve Operation Test",
//       },
//     ],
//   },
//   {
//     id: "sec7",
//     title: "7. Fire Door and Passive Fire Protection Inspection",
//     items: [
//       {
//         id: "7-1",
//         text: "Fire Door Self-Closing and Positive Latching Mechanism Test",
//       },
//       {
//         id: "7-2",
//         text: "Magnetic Hold-Open Device and Smoke Detector Release Verification",
//       },
//       {
//         id: "7-3",
//         text: "Firestopping and Penetration Seal Integrity Inspection",
//       },
//     ],
//   },
//   {
//     id: "sec8",
//     title: "8. Emergency Communication and Evacuation System Testing",
//     items: [
//       {
//         id: "8-1",
//         text: "Mass Notification System Audio Intelligibility Testing",
//       },
//       {
//         id: "8-2",
//         text: "Firefighter Telephone and Two-Way Communication Jack Testing",
//       },
//       {
//         id: "8-3",
//         text: "Emergency Generator and UPS Fire System Power Backup Test",
//       },
//     ],
//   },
// ];

export const checklistData = [
  {
    id: "sec1",
    title: "1. Initial Response",
    items: [
      {
        id: "1-1",
        text: "Did you confirm the exact location of the fire/smoke alarm?",
      },
      {
        id: "1-2",
        text: "Did you verify the alarm through the Fire Alarm Panel, CCTV, or any other monitoring source?",
      },
      {
        id: "1-3",
        text: "Did you inform the Airport Operations Control Center (AOCC)?",
      },
      {
        id: "1-4",
        text: "Did you notify the Airport Rescue & Fire Fighting (ARFF) team ?",
      },
      {
        id: "1-5",
        text: "Did you record the exact time when the alarm was received?",
      },
    ],
  },
  {
    id: "sec2",
    title: "2. Area Assessment",
    items: [
      {
        id: "2-1",
        text: "Did you/ safety officer proceed to the affected area?",
      },
      {
        id: "2-2",
        text: "Did you / safety officer check for visible smoke, flames, or burning smell?",
      },
      {
        id: "2-3",
        text: "Did you / safety officer identify the source of the fire or smoke?",
      },
      {
        id: "2-4",
        text: "Did you assess whether it was a genuine or a false alarm?",
      },
      {
        id: "2-5",
        text: "Did you ensure your personal safety while approaching the affected area?",
      },
    ],
  },
  {
    id: "sec3",
    title: "3. Communication",
    items: [
      {
        id: "3-1",
        text: "Did you inform the Airport Duty Manager?",
      },
      {
        id: "3-2",
        text: "Did you inform the ARFF Team?",
      },
      {
        id: "3-3",
        text: "	Did you inform the Security Team?",
      },
      {
        id: "3-4",
        text: "Did you inform the Maintenance/Electrical Team?",
      },
      {
        id: "3-5",
        text: "Did you inform the Medical Team (if required)?",
      },
      {
        id: "3-6",
        text: "Did you provide the exact location and current situation details to the emergency responders?",
      },
      {
        id: "3-7",
        text: "Did you inform the emergency responders about any hazardous materials nearby?",
      },
    ],
  },
  {
    id: "sec4",
    title: "4. Passenger & Staff Safety",
    items: [
      {
        id: "4-1",
        text: "Did you stop entry into the affected area for Passenger and staff ?",
      },
      {
        id: "4-2",
        text: "Did you guide passengers and staff to the nearest emergency exit?",
      },
      {
        id: "4-3",
        text: "Did you ensure an orderly evacuation?",
      },
      {
        id: "4-4",
        text: "Did you assist elderly persons, children, and persons with disabilities during evacuation?",
      },
      {
        id: "4-5",
        text: "Did you take measures to prevent panic and maintain crowd control?",
      },
    ],
  },
  {
    id: "sec5",
    title: "5. Fire Fighting (If Safe)",
    items: [
      {
        id: "5-1",
        text: "Did you identify the type/class of fire before attempting to extinguish it?",
      },
      {
        id: "5-2",
        text: "Did Safety officer use the appropriate fire extinguisher for the type of fire?",
      },
      {
        id: "5-3",
        text: "Did you ensure that using water on an electrical fire?",
      },
      {
        id: "5-4",
        text: "If the fire was beyond control, did you evacuate immediately and wait for the ARFF team?",
      },
    ],
  },
  {
    id: "sec6",
    title: "6. Utility Isolation",
    items: [
      {
        id: "6-1",
        text: "Did you ensure to switch off the electrical supply where it was safe to do so?",
      },
      {
        id: "6-2",
        text: "Did you ensure of shut down the gas/fuel supply (if applicable)?",
      },
      {
        id: "6-3",
        text: "Did you isolate the HVAC/Air Conditioning system to prevent smoke spread?",
      },
      {
        id: "6-4",
        text: "Did you coordinate with the Engineering/Maintenance team?",
      },
    ],
  },
  {
    id: "sec7",
    title: "7. Medical Assistance",
    items: [
      {
        id: "7-1",
        text: "Did you arrange first aid for any injured persons?",
      },
      {
        id: "7-2",
        text: "Did you call ambulance services when required?",
      },
      {
        id: "7-3",
        text: "Did you coordinate with the airport medical team?",
      },
    ],
  },
  {
    id: "sec8",
    title: "8. Incident Documentation",
    items: [
      {
        id: "8-1",
        text: "Did you record the date, time, location, alarm source, cause (if known), actions taken, agencies involved, and any injuries or damages??",
      },
      {
        id: "8-2",
        text: "Did you take photographs or collect evidence (where permitted)?",
      },
      {
        id: "8-3",
        text: "Did you prepare and submit the incident report?",
      },
    ],
  },
  {
    id: "sec9",
    title: "9. Recovery & Restoration",
    items: [
      {
        id: "9-1",
        text: "Did you ensure the affected area was declared safe by the ARFF team?",
      },
      {
        id: "9-2",
        text: "Did you verify that the fire alarm system was reset correctly?",
      },
      {
        id: "9-3",
        text: "Did you restore utilities only after receiving the necessary approvals?",
      },
      {
        id: "9-4",
        text: "Did you resume operations only after clearance from the Airport Duty Manager?",
      },
      {
        id: "9-5",
        text: "Did you conduct a post-incident review and identify corrective actions?",
      },
    ],
  },
];
