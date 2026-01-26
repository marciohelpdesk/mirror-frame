import { ChecklistSection } from '@/types';

export const STANDARD_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    id: 'kitchen',
    title: 'Kitchen',
    items: [
      { id: 'k1', label: 'Wipe down all countertops', completed: false, photoRequired: false },
      { id: 'k2', label: 'Clean stovetop and oven exterior', completed: false, photoRequired: false },
      { id: 'k3', label: 'Clean microwave inside and out', completed: false, photoRequired: false },
      { id: 'k4', label: 'Wipe cabinet fronts', completed: false, photoRequired: false },
      { id: 'k5', label: 'Clean sink and faucet', completed: false, photoRequired: false },
      { id: 'k6', label: 'Empty and wipe trash can', completed: false, photoRequired: false },
      { id: 'k7', label: 'Sweep and mop floor', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'living',
    title: 'Living Room',
    items: [
      { id: 'l1', label: 'Dust all surfaces and shelves', completed: false, photoRequired: false },
      { id: 'l2', label: 'Vacuum carpet/mop floor', completed: false, photoRequired: false },
      { id: 'l3', label: 'Fluff and arrange pillows', completed: false, photoRequired: false },
      { id: 'l4', label: 'Wipe down TV screen and remotes', completed: false, photoRequired: false },
      { id: 'l5', label: 'Clean mirrors and glass', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    items: [
      { id: 'b1', label: 'Change bed sheets and pillowcases', completed: false, photoRequired: true },
      { id: 'b2', label: 'Make bed neatly', completed: false, photoRequired: false },
      { id: 'b3', label: 'Dust nightstands and dressers', completed: false, photoRequired: false },
      { id: 'b4', label: 'Vacuum/mop floors', completed: false, photoRequired: false },
      { id: 'b5', label: 'Organize closet hangers', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'bathroom',
    title: 'Bathroom',
    items: [
      { id: 'ba1', label: 'Scrub and sanitize toilet', completed: false, photoRequired: false },
      { id: 'ba2', label: 'Clean shower/tub and glass doors', completed: false, photoRequired: false },
      { id: 'ba3', label: 'Wipe down sink and vanity', completed: false, photoRequired: false },
      { id: 'ba4', label: 'Replace towels', completed: false, photoRequired: true },
      { id: 'ba5', label: 'Refill toiletries (soap, shampoo)', completed: false, photoRequired: false },
      { id: 'ba6', label: 'Clean mirror', completed: false, photoRequired: false },
      { id: 'ba7', label: 'Mop floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'outdoor',
    title: 'Outdoor',
    items: [
      { id: 'o1', label: 'Sweep patio/balcony floor', completed: false, photoRequired: false },
      { id: 'o2', label: 'Wipe outdoor furniture', completed: false, photoRequired: false },
      { id: 'o3', label: 'Check for cigarette butts/trash', completed: false, photoRequired: false },
    ]
  }
];

export const AIRBNB_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    id: 'airbnb-entry',
    title: 'Entry & First Impressions',
    items: [
      { id: 'ae1', label: 'Clean front door and handle', completed: false, photoRequired: false },
      { id: 'ae2', label: 'Sweep/vacuum entryway', completed: false, photoRequired: false },
      { id: 'ae3', label: 'Organize shoe rack/coat hooks', completed: false, photoRequired: false },
      { id: 'ae4', label: 'Check welcome sign/decor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-kitchen',
    title: 'Kitchen',
    items: [
      { id: 'ak1', label: 'Clean all countertops', completed: false, photoRequired: false },
      { id: 'ak2', label: 'Clean stovetop and oven', completed: false, photoRequired: false },
      { id: 'ak3', label: 'Clean microwave inside and out', completed: false, photoRequired: false },
      { id: 'ak4', label: 'Clean refrigerator interior (check for old food)', completed: false, photoRequired: false },
      { id: 'ak5', label: 'Run and empty dishwasher', completed: false, photoRequired: false },
      { id: 'ak6', label: 'Restock coffee/tea supplies', completed: false, photoRequired: true },
      { id: 'ak7', label: 'Check dish soap and sponge', completed: false, photoRequired: false },
      { id: 'ak8', label: 'Clean sink and faucet', completed: false, photoRequired: false },
      { id: 'ak9', label: 'Empty trash and replace bag', completed: false, photoRequired: false },
      { id: 'ak10', label: 'Sweep and mop floor', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'airbnb-living',
    title: 'Living Room',
    items: [
      { id: 'al1', label: 'Dust all surfaces', completed: false, photoRequired: false },
      { id: 'al2', label: 'Vacuum/mop floors', completed: false, photoRequired: false },
      { id: 'al3', label: 'Fluff and arrange pillows/throws', completed: false, photoRequired: false },
      { id: 'al4', label: 'Clean TV screen', completed: false, photoRequired: false },
      { id: 'al5', label: 'Replace remote batteries if needed', completed: false, photoRequired: false },
      { id: 'al6', label: 'Check WiFi info card is visible', completed: false, photoRequired: false },
      { id: 'al7', label: 'Organize books/magazines', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-bedroom',
    title: 'Bedroom(s)',
    items: [
      { id: 'ab1', label: 'Strip and remake bed with fresh linens', completed: false, photoRequired: true },
      { id: 'ab2', label: 'Fluff pillows and arrange decoratively', completed: false, photoRequired: false },
      { id: 'ab3', label: 'Dust all furniture', completed: false, photoRequired: false },
      { id: 'ab4', label: 'Vacuum/mop floors', completed: false, photoRequired: false },
      { id: 'ab5', label: 'Check nightstand drawers (empty)', completed: false, photoRequired: false },
      { id: 'ab6', label: 'Organize closet with hangers', completed: false, photoRequired: false },
      { id: 'ab7', label: 'Check for forgotten items under bed', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-bathroom',
    title: 'Bathroom(s)',
    items: [
      { id: 'aba1', label: 'Scrub and sanitize toilet', completed: false, photoRequired: false },
      { id: 'aba2', label: 'Clean shower/tub thoroughly', completed: false, photoRequired: false },
      { id: 'aba3', label: 'Clean glass doors (no water spots)', completed: false, photoRequired: false },
      { id: 'aba4', label: 'Wipe sink and vanity', completed: false, photoRequired: false },
      { id: 'aba5', label: 'Clean and polish mirror', completed: false, photoRequired: false },
      { id: 'aba6', label: 'Hang fresh towels (hotel fold)', completed: false, photoRequired: true },
      { id: 'aba7', label: 'Refill shampoo/conditioner/body wash', completed: false, photoRequired: true },
      { id: 'aba8', label: 'Refill hand soap', completed: false, photoRequired: false },
      { id: 'aba9', label: 'Replace toilet paper (fold end)', completed: false, photoRequired: false },
      { id: 'aba10', label: 'Empty trash', completed: false, photoRequired: false },
      { id: 'aba11', label: 'Mop floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-amenities',
    title: 'Guest Amenities',
    items: [
      { id: 'am1', label: 'Check hair dryer is working', completed: false, photoRequired: false },
      { id: 'am2', label: 'Verify iron/ironing board available', completed: false, photoRequired: false },
      { id: 'am3', label: 'Check first aid kit', completed: false, photoRequired: false },
      { id: 'am4', label: 'Verify fire extinguisher accessible', completed: false, photoRequired: false },
      { id: 'am5', label: 'Test smoke/CO detectors', completed: false, photoRequired: false },
      { id: 'am6', label: 'Check all lights working', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-final',
    title: 'Final Touches',
    items: [
      { id: 'af1', label: 'Set thermostat to default', completed: false, photoRequired: false },
      { id: 'af2', label: 'Close all blinds/curtains uniformly', completed: false, photoRequired: false },
      { id: 'af3', label: 'Turn off all lights except entry', completed: false, photoRequired: false },
      { id: 'af4', label: 'Lock all windows', completed: false, photoRequired: false },
      { id: 'af5', label: 'Take final walkthrough photo', completed: false, photoRequired: true },
    ]
  }
];

export const DEEP_CLEAN_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    id: 'deep-kitchen',
    title: 'Kitchen (Deep Clean)',
    items: [
      { id: 'dk1', label: 'Clean inside oven', completed: false, photoRequired: true },
      { id: 'dk2', label: 'Clean range hood and filter', completed: false, photoRequired: false },
      { id: 'dk3', label: 'Deep clean refrigerator (all shelves)', completed: false, photoRequired: true },
      { id: 'dk4', label: 'Clean inside cabinets', completed: false, photoRequired: false },
      { id: 'dk5', label: 'Degrease backsplash', completed: false, photoRequired: false },
      { id: 'dk6', label: 'Clean dishwasher interior', completed: false, photoRequired: false },
      { id: 'dk7', label: 'Descale faucet and sink', completed: false, photoRequired: false },
      { id: 'dk8', label: 'Clean garbage disposal', completed: false, photoRequired: false },
      { id: 'dk9', label: 'Wipe down all appliances', completed: false, photoRequired: false },
      { id: 'dk10', label: 'Clean light fixtures', completed: false, photoRequired: false },
      { id: 'dk11', label: 'Scrub grout lines', completed: false, photoRequired: false },
      { id: 'dk12', label: 'Move appliances and clean behind', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'deep-bathroom',
    title: 'Bathroom (Deep Clean)',
    items: [
      { id: 'dba1', label: 'Descale showerhead', completed: false, photoRequired: false },
      { id: 'dba2', label: 'Remove and clean shower door tracks', completed: false, photoRequired: false },
      { id: 'dba3', label: 'Clean exhaust fan', completed: false, photoRequired: false },
      { id: 'dba4', label: 'Scrub tile grout', completed: false, photoRequired: true },
      { id: 'dba5', label: 'Clean inside medicine cabinet', completed: false, photoRequired: false },
      { id: 'dba6', label: 'Clean under sink cabinet', completed: false, photoRequired: false },
      { id: 'dba7', label: 'Sanitize toothbrush holder area', completed: false, photoRequired: false },
      { id: 'dba8', label: 'Clean toilet tank interior', completed: false, photoRequired: false },
      { id: 'dba9', label: 'Descale faucets', completed: false, photoRequired: false },
      { id: 'dba10', label: 'Clean light fixtures', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'deep-bedroom',
    title: 'Bedroom (Deep Clean)',
    items: [
      { id: 'dbe1', label: 'Vacuum mattress', completed: false, photoRequired: false },
      { id: 'dbe2', label: 'Flip/rotate mattress', completed: false, photoRequired: false },
      { id: 'dbe3', label: 'Clean under bed thoroughly', completed: false, photoRequired: false },
      { id: 'dbe4', label: 'Dust ceiling fan blades', completed: false, photoRequired: false },
      { id: 'dbe5', label: 'Clean inside closet shelves', completed: false, photoRequired: false },
      { id: 'dbe6', label: 'Wipe baseboards', completed: false, photoRequired: false },
      { id: 'dbe7', label: 'Clean window tracks', completed: false, photoRequired: false },
      { id: 'dbe8', label: 'Dust blinds/curtains', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'deep-living',
    title: 'Living Areas (Deep Clean)',
    items: [
      { id: 'dl1', label: 'Move furniture and vacuum underneath', completed: false, photoRequired: false },
      { id: 'dl2', label: 'Clean upholstery/couch cushions', completed: false, photoRequired: false },
      { id: 'dl3', label: 'Dust ceiling fans and fixtures', completed: false, photoRequired: false },
      { id: 'dl4', label: 'Clean all window interiors', completed: false, photoRequired: true },
      { id: 'dl5', label: 'Wipe all baseboards', completed: false, photoRequired: false },
      { id: 'dl6', label: 'Clean door frames and handles', completed: false, photoRequired: false },
      { id: 'dl7', label: 'Dust crown molding', completed: false, photoRequired: false },
      { id: 'dl8', label: 'Clean vents and registers', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'deep-extras',
    title: 'Extra Deep Clean Tasks',
    items: [
      { id: 'de1', label: 'Clean inside washer/dryer', completed: false, photoRequired: false },
      { id: 'de2', label: 'Clean dryer vent', completed: false, photoRequired: false },
      { id: 'de3', label: 'Clean garage floor', completed: false, photoRequired: false },
      { id: 'de4', label: 'Pressure wash outdoor areas', completed: false, photoRequired: true },
      { id: 'de5', label: 'Clean outdoor furniture thoroughly', completed: false, photoRequired: false },
    ]
  }
];

export const MOVE_IN_OUT_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    id: 'move-kitchen',
    title: 'Kitchen (Move Cleaning)',
    items: [
      { id: 'mk1', label: 'Clean inside all cabinets', completed: false, photoRequired: true },
      { id: 'mk2', label: 'Clean inside drawers', completed: false, photoRequired: false },
      { id: 'mk3', label: 'Deep clean oven interior', completed: false, photoRequired: true },
      { id: 'mk4', label: 'Clean oven racks', completed: false, photoRequired: false },
      { id: 'mk5', label: 'Clean refrigerator interior completely', completed: false, photoRequired: true },
      { id: 'mk6', label: 'Clean freezer interior', completed: false, photoRequired: false },
      { id: 'mk7', label: 'Clean dishwasher interior', completed: false, photoRequired: false },
      { id: 'mk8', label: 'Clean range hood and filter', completed: false, photoRequired: false },
      { id: 'mk9', label: 'Degrease all surfaces', completed: false, photoRequired: false },
      { id: 'mk10', label: 'Clean countertops and backsplash', completed: false, photoRequired: false },
      { id: 'mk11', label: 'Clean sink and garbage disposal', completed: false, photoRequired: false },
      { id: 'mk12', label: 'Clean and polish faucets', completed: false, photoRequired: false },
      { id: 'mk13', label: 'Clean light fixtures', completed: false, photoRequired: false },
      { id: 'mk14', label: 'Scrub floors thoroughly', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'move-bathroom',
    title: 'Bathroom (Move Cleaning)',
    items: [
      { id: 'mba1', label: 'Clean inside medicine cabinet', completed: false, photoRequired: false },
      { id: 'mba2', label: 'Clean inside vanity cabinets', completed: false, photoRequired: false },
      { id: 'mba3', label: 'Deep clean toilet (including behind)', completed: false, photoRequired: false },
      { id: 'mba4', label: 'Scrub tub/shower thoroughly', completed: false, photoRequired: true },
      { id: 'mba5', label: 'Clean shower door tracks', completed: false, photoRequired: false },
      { id: 'mba6', label: 'Descale all fixtures', completed: false, photoRequired: false },
      { id: 'mba7', label: 'Clean exhaust fan', completed: false, photoRequired: false },
      { id: 'mba8', label: 'Scrub tile grout', completed: false, photoRequired: false },
      { id: 'mba9', label: 'Clean mirror thoroughly', completed: false, photoRequired: false },
      { id: 'mba10', label: 'Scrub and mop floor', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'move-bedroom',
    title: 'Bedrooms (Move Cleaning)',
    items: [
      { id: 'mbe1', label: 'Clean inside all closets', completed: false, photoRequired: true },
      { id: 'mbe2', label: 'Clean closet shelves and rods', completed: false, photoRequired: false },
      { id: 'mbe3', label: 'Clean window sills and tracks', completed: false, photoRequired: false },
      { id: 'mbe4', label: 'Wipe all baseboards', completed: false, photoRequired: false },
      { id: 'mbe5', label: 'Clean ceiling fan', completed: false, photoRequired: false },
      { id: 'mbe6', label: 'Clean light fixtures', completed: false, photoRequired: false },
      { id: 'mbe7', label: 'Clean door and door frame', completed: false, photoRequired: false },
      { id: 'mbe8', label: 'Vacuum/mop floors thoroughly', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'move-living',
    title: 'Living Areas (Move Cleaning)',
    items: [
      { id: 'ml1', label: 'Clean all windows interior', completed: false, photoRequired: false },
      { id: 'ml2', label: 'Clean window blinds/shades', completed: false, photoRequired: false },
      { id: 'ml3', label: 'Clean all baseboards', completed: false, photoRequired: false },
      { id: 'ml4', label: 'Clean vents and registers', completed: false, photoRequired: false },
      { id: 'ml5', label: 'Clean all door handles', completed: false, photoRequired: false },
      { id: 'ml6', label: 'Clean light switches and outlets', completed: false, photoRequired: false },
      { id: 'ml7', label: 'Clean ceiling fans', completed: false, photoRequired: false },
      { id: 'ml8', label: 'Clean fireplace (if applicable)', completed: false, photoRequired: false },
      { id: 'ml9', label: 'Vacuum/mop all floors', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'move-other',
    title: 'Other Areas',
    items: [
      { id: 'mo1', label: 'Clean laundry area', completed: false, photoRequired: false },
      { id: 'mo2', label: 'Clean inside washer/dryer', completed: false, photoRequired: false },
      { id: 'mo3', label: 'Clean garage floor (if applicable)', completed: false, photoRequired: false },
      { id: 'mo4', label: 'Clean patio/balcony', completed: false, photoRequired: false },
      { id: 'mo5', label: 'Clean front door inside and out', completed: false, photoRequired: false },
      { id: 'mo6', label: 'Final walkthrough inspection', completed: false, photoRequired: true },
    ]
  }
];

export const RECURRING_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    id: 'rec-kitchen',
    title: 'Kitchen',
    items: [
      { id: 'rk1', label: 'Wipe countertops', completed: false, photoRequired: false },
      { id: 'rk2', label: 'Clean stovetop', completed: false, photoRequired: false },
      { id: 'rk3', label: 'Wipe microwave exterior', completed: false, photoRequired: false },
      { id: 'rk4', label: 'Clean sink', completed: false, photoRequired: false },
      { id: 'rk5', label: 'Empty and replace trash', completed: false, photoRequired: false },
      { id: 'rk6', label: 'Wipe appliance exteriors', completed: false, photoRequired: false },
      { id: 'rk7', label: 'Sweep and mop floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'rec-bathroom',
    title: 'Bathroom(s)',
    items: [
      { id: 'rba1', label: 'Clean and sanitize toilet', completed: false, photoRequired: false },
      { id: 'rba2', label: 'Clean shower/tub', completed: false, photoRequired: false },
      { id: 'rba3', label: 'Clean sink and vanity', completed: false, photoRequired: false },
      { id: 'rba4', label: 'Clean mirror', completed: false, photoRequired: false },
      { id: 'rba5', label: 'Empty trash', completed: false, photoRequired: false },
      { id: 'rba6', label: 'Mop floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'rec-bedroom',
    title: 'Bedroom(s)',
    items: [
      { id: 'rbe1', label: 'Make beds', completed: false, photoRequired: false },
      { id: 'rbe2', label: 'Dust surfaces', completed: false, photoRequired: false },
      { id: 'rbe3', label: 'Vacuum/mop floors', completed: false, photoRequired: false },
      { id: 'rbe4', label: 'Empty trash', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'rec-living',
    title: 'Living Areas',
    items: [
      { id: 'rl1', label: 'Dust all surfaces', completed: false, photoRequired: false },
      { id: 'rl2', label: 'Vacuum carpets/rugs', completed: false, photoRequired: false },
      { id: 'rl3', label: 'Mop hard floors', completed: false, photoRequired: false },
      { id: 'rl4', label: 'Tidy up general clutter', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'rec-general',
    title: 'General Tasks',
    items: [
      { id: 'rg1', label: 'Empty all trash cans', completed: false, photoRequired: false },
      { id: 'rg2', label: 'Spot clean mirrors/glass', completed: false, photoRequired: false },
      { id: 'rg3', label: 'Wipe light switches/door handles', completed: false, photoRequired: false },
    ]
  }
];

export const POST_CONSTRUCTION_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    id: 'pc-dust',
    title: 'Dust & Debris Removal',
    items: [
      { id: 'pd1', label: 'Remove all construction debris', completed: false, photoRequired: true },
      { id: 'pd2', label: 'Vacuum all surfaces (walls, ceilings)', completed: false, photoRequired: false },
      { id: 'pd3', label: 'Wipe down all walls', completed: false, photoRequired: false },
      { id: 'pd4', label: 'Clean all vents and registers', completed: false, photoRequired: false },
      { id: 'pd5', label: 'Dust light fixtures and ceiling fans', completed: false, photoRequired: false },
      { id: 'pd6', label: 'Clean HVAC vents thoroughly', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'pc-windows',
    title: 'Windows & Glass',
    items: [
      { id: 'pw1', label: 'Remove stickers/labels from windows', completed: false, photoRequired: false },
      { id: 'pw2', label: 'Clean all windows inside and out', completed: false, photoRequired: true },
      { id: 'pw3', label: 'Clean window tracks and frames', completed: false, photoRequired: false },
      { id: 'pw4', label: 'Clean all glass doors', completed: false, photoRequired: false },
      { id: 'pw5', label: 'Clean all mirrors', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'pc-kitchen',
    title: 'Kitchen',
    items: [
      { id: 'pk1', label: 'Remove protective film from appliances', completed: false, photoRequired: false },
      { id: 'pk2', label: 'Clean inside all cabinets', completed: false, photoRequired: true },
      { id: 'pk3', label: 'Clean inside all drawers', completed: false, photoRequired: false },
      { id: 'pk4', label: 'Clean all appliances inside and out', completed: false, photoRequired: false },
      { id: 'pk5', label: 'Clean countertops thoroughly', completed: false, photoRequired: false },
      { id: 'pk6', label: 'Clean sink and faucets', completed: false, photoRequired: false },
      { id: 'pk7', label: 'Scrub and seal grout lines', completed: false, photoRequired: false },
      { id: 'pk8', label: 'Clean floors (remove any adhesive)', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'pc-bathroom',
    title: 'Bathrooms',
    items: [
      { id: 'pba1', label: 'Remove protective film/stickers', completed: false, photoRequired: false },
      { id: 'pba2', label: 'Clean inside vanity cabinets', completed: false, photoRequired: false },
      { id: 'pba3', label: 'Clean toilet thoroughly', completed: false, photoRequired: false },
      { id: 'pba4', label: 'Clean tub/shower (remove grout residue)', completed: false, photoRequired: true },
      { id: 'pba5', label: 'Clean glass shower doors', completed: false, photoRequired: false },
      { id: 'pba6', label: 'Clean all fixtures', completed: false, photoRequired: false },
      { id: 'pba7', label: 'Scrub tile and grout', completed: false, photoRequired: false },
      { id: 'pba8', label: 'Clean exhaust fan', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'pc-floors',
    title: 'Floors & Surfaces',
    items: [
      { id: 'pf1', label: 'Remove paint drips from floors', completed: false, photoRequired: false },
      { id: 'pf2', label: 'Remove adhesive residue', completed: false, photoRequired: false },
      { id: 'pf3', label: 'Clean all baseboards', completed: false, photoRequired: false },
      { id: 'pf4', label: 'Vacuum all floors', completed: false, photoRequired: false },
      { id: 'pf5', label: 'Mop all hard floors', completed: false, photoRequired: true },
      { id: 'pf6', label: 'Clean stairs and railings', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'pc-final',
    title: 'Final Inspection',
    items: [
      { id: 'pfi1', label: 'Check for any remaining debris', completed: false, photoRequired: false },
      { id: 'pfi2', label: 'Verify all surfaces dust-free', completed: false, photoRequired: false },
      { id: 'pfi3', label: 'Final quality inspection', completed: false, photoRequired: true },
      { id: 'pfi4', label: 'Take completion photos', completed: false, photoRequired: true },
    ]
  }
];

export const COMMERCIAL_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    id: 'comm-lobby',
    title: 'Lobby & Reception',
    items: [
      { id: 'cl1', label: 'Clean entrance doors and glass', completed: false, photoRequired: false },
      { id: 'cl2', label: 'Vacuum/mop lobby floor', completed: false, photoRequired: false },
      { id: 'cl3', label: 'Clean reception desk', completed: false, photoRequired: false },
      { id: 'cl4', label: 'Dust waiting area furniture', completed: false, photoRequired: false },
      { id: 'cl5', label: 'Water plants (if applicable)', completed: false, photoRequired: false },
      { id: 'cl6', label: 'Empty trash cans', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'comm-office',
    title: 'Office Areas',
    items: [
      { id: 'co1', label: 'Dust all desks and workstations', completed: false, photoRequired: false },
      { id: 'co2', label: 'Clean computer screens and keyboards', completed: false, photoRequired: false },
      { id: 'co3', label: 'Empty all desk trash cans', completed: false, photoRequired: false },
      { id: 'co4', label: 'Vacuum office floors', completed: false, photoRequired: false },
      { id: 'co5', label: 'Clean conference room tables', completed: false, photoRequired: false },
      { id: 'co6', label: 'Clean whiteboards', completed: false, photoRequired: false },
      { id: 'co7', label: 'Dust window sills', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'comm-break',
    title: 'Break Room / Kitchen',
    items: [
      { id: 'cb1', label: 'Clean countertops', completed: false, photoRequired: false },
      { id: 'cb2', label: 'Clean microwave inside and out', completed: false, photoRequired: false },
      { id: 'cb3', label: 'Clean coffee maker', completed: false, photoRequired: false },
      { id: 'cb4', label: 'Clean refrigerator exterior', completed: false, photoRequired: false },
      { id: 'cb5', label: 'Load/unload dishwasher', completed: false, photoRequired: false },
      { id: 'cb6', label: 'Clean sink', completed: false, photoRequired: false },
      { id: 'cb7', label: 'Clean tables and chairs', completed: false, photoRequired: false },
      { id: 'cb8', label: 'Empty trash and recycling', completed: false, photoRequired: false },
      { id: 'cb9', label: 'Sweep and mop floor', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'comm-restroom',
    title: 'Restrooms',
    items: [
      { id: 'cr1', label: 'Clean and sanitize all toilets', completed: false, photoRequired: false },
      { id: 'cr2', label: 'Clean urinals (if applicable)', completed: false, photoRequired: false },
      { id: 'cr3', label: 'Clean all sinks', completed: false, photoRequired: false },
      { id: 'cr4', label: 'Clean mirrors', completed: false, photoRequired: false },
      { id: 'cr5', label: 'Refill soap dispensers', completed: false, photoRequired: true },
      { id: 'cr6', label: 'Refill paper towels', completed: false, photoRequired: true },
      { id: 'cr7', label: 'Refill toilet paper', completed: false, photoRequired: false },
      { id: 'cr8', label: 'Empty trash and sanitary bins', completed: false, photoRequired: false },
      { id: 'cr9', label: 'Mop floors', completed: false, photoRequired: false },
      { id: 'cr10', label: 'Check air fresheners', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'comm-common',
    title: 'Common Areas',
    items: [
      { id: 'cc1', label: 'Vacuum/mop hallways', completed: false, photoRequired: false },
      { id: 'cc2', label: 'Clean elevator interior (if applicable)', completed: false, photoRequired: false },
      { id: 'cc3', label: 'Dust handrails', completed: false, photoRequired: false },
      { id: 'cc4', label: 'Clean stairwells', completed: false, photoRequired: false },
      { id: 'cc5', label: 'Empty all common area trash', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'comm-final',
    title: 'Final Tasks',
    items: [
      { id: 'cf1', label: 'Lock all doors', completed: false, photoRequired: false },
      { id: 'cf2', label: 'Turn off lights in empty areas', completed: false, photoRequired: false },
      { id: 'cf3', label: 'Set alarm (if applicable)', completed: false, photoRequired: false },
      { id: 'cf4', label: 'Complete cleaning log', completed: false, photoRequired: false },
    ]
  }
];

export type ChecklistPresetKey = 
  | 'standard' 
  | 'airbnb' 
  | 'deep_clean' 
  | 'move_in_out' 
  | 'recurring' 
  | 'post_construction' 
  | 'commercial';

export const CHECKLIST_PRESETS: Record<ChecklistPresetKey, {
  labelKey: string;
  template: ChecklistSection[];
}> = {
  standard: {
    labelKey: 'checklist.preset.standard',
    template: STANDARD_CHECKLIST_TEMPLATE,
  },
  airbnb: {
    labelKey: 'checklist.preset.airbnb',
    template: AIRBNB_CHECKLIST_TEMPLATE,
  },
  deep_clean: {
    labelKey: 'checklist.preset.deepClean',
    template: DEEP_CLEAN_CHECKLIST_TEMPLATE,
  },
  move_in_out: {
    labelKey: 'checklist.preset.moveInOut',
    template: MOVE_IN_OUT_CHECKLIST_TEMPLATE,
  },
  recurring: {
    labelKey: 'checklist.preset.recurring',
    template: RECURRING_CHECKLIST_TEMPLATE,
  },
  post_construction: {
    labelKey: 'checklist.preset.postConstruction',
    template: POST_CONSTRUCTION_CHECKLIST_TEMPLATE,
  },
  commercial: {
    labelKey: 'checklist.preset.commercial',
    template: COMMERCIAL_CHECKLIST_TEMPLATE,
  },
};
