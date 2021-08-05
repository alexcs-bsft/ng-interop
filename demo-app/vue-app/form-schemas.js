
export const replayPastEvents = [
  {
    "label": "Event Name",
    "model": "event_name",
    "component": "form-input",
    "default": "view",
    "required": true
  },
  [
    {
      "label": "Start Offset",
      "model": "start_offset",
      "component": "form-input",
      "type": "number",
      "default": 7,
      "required": true
    },
    {
      "label": "End Offset",
      "model": "end_offset",
      "component": "form-input",
      "type": "number",
      "default": 0,
      "required": true
    },
    {
      "label": "Time Unit",
      "model": "time_unit",
      "component": "form-select",
      "options": [
        "Hours",
        "Days",
        "Weeks",
        "Months",
      ],
      "required": true
    },
  ],
];
