// AROHON — Course and seed data definitions
// All data labeled as demo/seed data for the hackathon

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: string;
  teacher?: string;
  topics: string[];
}

export interface Resource {
  id: string;
  title: string;
  courseId: string;
  type: 'lecture-slides' | 'senior-notes' | 'ct-questions' | 'final-questions' | 'lab-manual' | 'reference' | 'exercises' | 'other';
  year?: number;
  topic?: string;
  source?: string;
  summary?: string;
}

export interface Deadline {
  id: string;
  title: string;
  courseId: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'done';
}

export interface UserProfile {
  name: string;
  department: string;
  series: string;
  courses: string[];
  upcomingExam?: string;
  studyHoursPerDay?: number;
}

export const DEPARTMENTS = ['CSE', 'EEE', 'ME', 'CE', 'ECE', 'IPE', 'MTE', 'URP', 'Arch', 'BECM', 'GCE', 'MSE'];

export const COURSES: Course[] = [
  {
    id: 'chem-1101',
    code: 'Chem 1101',
    name: 'Chemistry',
    department: 'CSE',
    semester: '1-1',
    teacher: 'Demo Teacher',
    topics: [
      'Atomic Structure & Periodic Properties',
      'Chemical Bonding',
      'Molecular Orbital Theory',
      'Hybridization',
      'VSEPR Theory',
      'Hydrogen Bonding',
      'Acids and Bases',
      'Thermodynamics',
      'Electrochemistry',
      'Polymer Chemistry',
    ],
  },
  {
    id: 'phy-1101',
    code: 'Phy 1101',
    name: 'Physics',
    department: 'CSE',
    semester: '1-1',
    topics: [
      'Wave Optics',
      'Interference & Diffraction',
      'Polarization',
      'Quantum Mechanics',
      'Crystal Structure',
      'Band Theory of Solids',
      'Semiconductor Physics',
      'Laser',
      'Fiber Optics',
    ],
  },
  {
    id: 'math-1101',
    code: 'Math 1101',
    name: 'Mathematics I',
    department: 'CSE',
    semester: '1-1',
    topics: [
      'Differential Calculus',
      'Successive Differentiation',
      'Mean Value Theorems',
      'Expansion of Functions',
      'Integral Calculus',
      'Definite Integrals',
      'Multiple Integrals',
      'Ordinary Differential Equations',
    ],
  },
  {
    id: 'eee-1101',
    code: 'EEE 1101',
    name: 'Basic Electrical Engineering',
    department: 'CSE',
    semester: '1-1',
    topics: [
      'DC Circuits',
      'AC Circuits',
      'Network Theorems',
      'Magnetic Circuits',
      'Transformers',
      'Electrical Machines',
      'Semiconductor Devices',
    ],
  },
  {
    id: 'cse-1101',
    code: 'CSE 1101',
    name: 'Introduction to Computer Science',
    department: 'CSE',
    semester: '1-1',
    topics: [
      'Number Systems',
      'Boolean Algebra',
      'Logic Gates',
      'Computer Organization',
      'Operating Systems Basics',
      'Programming Fundamentals',
    ],
  },
];

export interface SubjectSeedData {
  historicalQuestions: string;
  lectureContent: string;
}

export const DEMO_SUBJECT_DATA: Record<string, SubjectSeedData> = {
  'chem-1101': {
    historicalQuestions: `
=== DEMO SEED DATA — Chemistry (Chem 1101) Historical Questions ===
--- CT-1 2024 ---
1. (a) Define hybridization. Explain sp3, sp2, and sp hybridization with examples. [5 marks]
   (b) What is VSEPR theory? Predict the shape of NH3 and H2O using VSEPR theory. [5 marks]
2. (a) Explain the concept of molecular orbital theory. Draw the MO energy level diagram for O2 and determine its bond order. [6 marks]
   (b) Differentiate between intermolecular and intramolecular hydrogen bonding with examples. [4 marks]
--- CT-1 2023 ---
1. (a) Explain sp, sp2, sp3 hybridization with suitable examples. How does hybridization influence geometry? [5 marks]
   (b) Using molecular orbital theory, explain why O2 is paramagnetic while N2 is diamagnetic. Calculate their bond orders. [5 marks]
2. (a) Define hydrogen bonding. Why is the boiling point of H2O higher than H2S? [4 marks]
   (b) Apply VSEPR theory to predict the geometry of BF3, CH4, and SF6. [6 marks]
--- CT-1 2022 ---
1. (a) Explain the hybridization in ethylene (C2H4) and acetylene (C2H2). [5 marks]
   (b) Using MO theory, show the electronic configuration of N2. Calculate bond order. [5 marks]
2. (a) Describe the different types of hydrogen bonding with examples. [5 marks]
   (b) Predict the shapes of PCl5 and SF4 using VSEPR theory. [5 marks]
`,
    lectureContent: `
=== DEMO SEED DATA — Current Lecture Topics Covered ===
Lectures 1-3: Atomic Structure review, electron configuration
Lectures 4-5: Chemical bonding fundamentals, ionic vs covalent
Lectures 6-8: Molecular Orbital Theory — bonding/antibonding MOs, MO diagrams, bond order calculation
Lectures 9-10: Hybridization — sp, sp2, sp3, sp3d, sp3d2
Lecture 11: VSEPR Theory — molecular geometry prediction
Lecture 12: Hydrogen bonding — types, effects on physical properties
Current emphasis: MO Theory and Hybridization (most lecture time spent)
`
  },
  'phy-1101': {
    historicalQuestions: `
=== DEMO SEED DATA — Physics (Phy 1101) Historical Questions ===
--- CT-1 2024 ---
1. (a) What is interference of light? Under what conditions is interference observed? [4 marks]
   (b) Derive the expression for the fringe width in Young's double-slit experiment. [6 marks]
2. (a) Distinguish between Fresnel and Fraunhofer diffraction. [4 marks]
   (b) What is polarization? Describe Brewster's Law and show that at polarizing angle, reflected and refracted rays are perpendicular. [6 marks]
--- CT-1 2023 ---
1. (a) Explain the concept of wave-particle duality and state de Broglie hypothesis. [4 marks]
   (b) Derive the time-independent Schrodinger wave equation. [6 marks]
2. (a) Explain the construction and working of a Ruby Laser. [5 marks]
   (b) Define numerical aperture of an optical fiber and derive its expression. [5 marks]
--- CT-1 2022 ---
1. (a) What is Newton's rings experiment? Why is the central spot dark in reflected light? [5 marks]
   (b) In Young's double-slit experiment, the slit separation is 0.2 mm and the screen is 1.2 m away. Find the fringe width for light of 6000 Å. [5 marks]
2. (a) Derive Schrodinger's time-dependent wave equation. [5 marks]
   (b) What is Einstein's photoelectric equation? Discuss the significance of work function. [5 marks]
`,
    lectureContent: `
=== DEMO SEED DATA — Current Lecture Topics Covered ===
Lectures 1-4: Wave Optics, interference principles, double slit, Newton's rings
Lectures 5-7: Diffraction phenomena, single-slit diffraction, diffraction grating
Lectures 8-9: Polarization of light, Brewster's law, double refraction
Lectures 10-12: Quantum mechanics intro, de Broglie wavelength, Heisenberg Uncertainty, Schrodinger equation
Current emphasis: Wave Optics (double slit) and Schrodinger wave equations
`
  },
  'math-1101': {
    historicalQuestions: `
=== DEMO SEED DATA — Mathematics (Math 1101) Historical Questions ===
--- CT-1 2024 ---
1. (a) Find the n-th derivative of y = ln(ax + b). [4 marks]
   (b) State and prove Leibnitz's Theorem for successive differentiation of the product of two functions. [6 marks]
2. (a) State Rolle's Theorem and verify it for f(x) = x(x-3)^2 in [0, 3]. [5 marks]
   (b) State Cauchy's Mean Value Theorem and verify it for f(x) = x^2 and g(x) = x^3 in [1, 2]. [5 marks]
--- CT-1 2023 ---
1. (a) If y = a*cos(ln x) + b*sin(ln x), prove that x^2 * y_(n+2) + (2n+1)x * y_(n+1) + (n^2 + 1)y_n = 0. [6 marks]
   (b) Find the n-th derivative of cos(ax+b). [4 marks]
2. (a) Verify Lagrange's Mean Value Theorem for f(x) = x^3 - x^2 - 5x + 3 in [0, 4]. [5 marks]
   (b) Expand e^x by Maclaurin's theorem. [5 marks]
--- CT-1 2022 ---
1. (a) If y = sin(m * sin^-1 x), show that (1-x^2)y_2 - x y_1 + m^2 y = 0. [5 marks]
   (b) State and prove Rolle's Theorem. [5 marks]
2. (a) Find the n-th derivative of 1 / (x^2 - a^2). [5 marks]
   (b) Explain Taylor's theorem for expansion of functions in finite form. [5 marks]
`,
    lectureContent: `
=== DEMO SEED DATA — Current Lecture Topics Covered ===
Lectures 1-4: Successive Differentiation, standard formulae for n-th derivatives
Lectures 5-8: Leibnitz Theorem and its applications to differential proofs
Lectures 9-11: Mean Value Theorems: Rolle's, Lagrange's, Cauchy's MVT with geometric interpretations
Lectures 12-14: Maclaurin's and Taylor's expansions of functions
Current emphasis: successive differentiation proofs using Leibnitz theorem, and Rolle's/Lagrange's MVTs
`
  },
  'eee-1101': {
    historicalQuestions: `
=== DEMO SEED DATA — EEE (EEE 1101) Historical Questions ===
--- CT-1 2024 ---
1. (a) State Kirchhoff's current and voltage laws (KCL & KVL). [4 marks]
   (b) Use nodal analysis to find the branch currents in a 3-loop bridge circuit. [6 marks]
2. (a) State and prove Thevenin's Theorem. [5 marks]
   (b) Find the Thevenin equivalent circuit across terminal A-B for the given network. [5 marks]
--- CT-1 2023 ---
1. (a) State Norton's Theorem and show its relationship with Thevenin's Theorem. [4 marks]
   (b) Find the Norton equivalent circuit and calculate the maximum power transferred to a load resistance. [6 marks]
2. (a) Define Average value, RMS value, Form factor, and Peak factor of an AC sinusoidal wave. [5 marks]
   (b) Derive the RMS value of a half-wave rectified sinusoidal current. [5 marks]
--- CT-1 2022 ---
1. (a) State Superposition Theorem. What are its limitations? [4 marks]
   (b) Solve the network using Superposition theorem to find voltage across 10 ohm resistor. [6 marks]
2. (a) Discuss magnetic circuits: reluctance, permeance, MMF, flux. Compare with electric circuits. [5 marks]
   (b) What is mutual inductance? Differentiate self and mutual inductance. [5 marks]
`,
    lectureContent: `
=== DEMO SEED DATA — Current Lecture Topics Covered ===
Lectures 1-3: DC Circuit basics, series-parallel reduction, KCL, KVL
Lectures 4-6: Loop analysis, Nodal analysis, branch current methods
Lectures 7-9: Network Theorems: Thevenin's, Norton's, Superposition, Maximum Power Transfer
Lectures 10-12: AC fundamentals, RMS and average value, sinusoidal waves, form factor
Current emphasis: Thevenin/Norton network theorem problems, nodal/mesh analysis in DC circuits
`
  },
  'cse-1101': {
    historicalQuestions: `
=== DEMO SEED DATA — CSE (CSE 1101) Historical Questions ===
--- CT-1 2024 ---
1. (a) Perform the following base conversions: (10110.11)_2 to decimal, (2F5.A)_16 to octal. [5 marks]
   (b) Subtract (45)_10 from (23)_10 using 2's complement arithmetic in 8-bit binary representation. [5 marks]
2. (a) State and prove De Morgan's Laws. [4 marks]
   (b) Simplify the Boolean function F(A,B,C,D) = sum(0, 2, 5, 7, 8, 10, 13, 15) using a Karnaugh Map (K-Map). [6 marks]
--- CT-1 2023 ---
1. (a) Differentiate between volatile and non-volatile memory with examples. [4 marks]
   (b) Draw the logic circuit diagram for a Full Adder using NAND gates only. [6 marks]
2. (a) What is an operating system? Discuss the main functions of an OS. [5 marks]
   (b) Draw a flowchart and write a pseudo-code to find the largest among three numbers. [5 marks]
--- CT-1 2022 ---
1. (a) Explain 1's and 2's complement of a binary number. Write benefits of 2's complement. [4 marks]
   (b) Simplify the expression Y = A'BC + AB'C + ABC' + ABC and implement using basic gates. [6 marks]
2. (a) Write notes on half adder, half subtractor, full adder. [5 marks]
   (b) Briefly explain computer memory hierarchy. [5 marks]
`,
    lectureContent: `
=== DEMO SEED DATA — Current Lecture Topics Covered ===
Lectures 1-3: Introduction to computer components, memory hierarchy
Lectures 4-6: Number Systems: binary, octal, hex, conversions, complements subtraction
Lectures 7-9: Boolean Algebra, theorems, logic gates representation, De Morgan's laws
Lectures 10-12: Combinational logic design, K-Maps, simplification, Adders/Subtractors
Current emphasis: base conversions, 2's complement arithmetic, K-Map simplification, Full Adder logic
`
  }
};

export const DEMO_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    title: 'CT-1 Questions 2020-2024',
    courseId: 'chem-1101',
    type: 'ct-questions',
    year: 2024,
    topic: 'Chemical Bonding & MO Theory',
    source: 'RUET CSE Archive (Demo)',
    summary: 'Historical class test questions covering chemical bonding, MO theory, hybridization, VSEPR, and hydrogen bonding.',
  },
  {
    id: 'res-2',
    title: 'Final Exam Questions 2023-2024',
    courseId: 'chem-1101',
    type: 'final-questions',
    year: 2024,
    topic: 'Full Course',
    source: 'RUET CSE Archive (Demo)',
    summary: 'Historical final exam papers covering all major chemistry topics.',
  },
  {
    id: 'res-3',
    title: 'Lecture Slides — Chemical Bonding',
    courseId: 'chem-1101',
    type: 'lecture-slides',
    year: 2024,
    topic: 'Chemical Bonding',
    source: 'Course Material (Demo)',
    summary: 'Lecture slides covering MO theory, hybridization, VSEPR theory.',
  },
  {
    id: 'res-4',
    title: 'Senior Notes — MO Theory',
    courseId: 'chem-1101',
    type: 'senior-notes',
    topic: 'Molecular Orbital Theory',
    source: 'Senior Batch (Demo)',
    summary: 'Comprehensive notes on molecular orbital theory with solved examples.',
  },
  {
    id: 'res-5',
    title: 'Reference — Hydrogen Bonding',
    courseId: 'chem-1101',
    type: 'reference',
    topic: 'Hydrogen Bonding',
    source: 'Textbook Reference (Demo)',
    summary: 'Detailed reference material on hydrogen bonding types and effects.',
  },
  {
    id: 'res-6',
    title: 'Wave Optics Lecture Notes',
    courseId: 'phy-1101',
    type: 'lecture-slides',
    year: 2024,
    topic: 'Wave Optics',
    source: 'Course Material (Demo)',
    summary: 'Lecture slides on interference, diffraction, and polarization.',
  },
  {
    id: 'res-7',
    title: 'Physics CT Questions 2022-2024',
    courseId: 'phy-1101',
    type: 'ct-questions',
    year: 2024,
    topic: 'Optics & Quantum Mechanics',
    source: 'RUET CSE Archive (Demo)',
    summary: 'Historical class test papers for Physics.',
  },
  {
    id: 'res-8',
    title: 'Calculus Reference Notes',
    courseId: 'math-1101',
    type: 'senior-notes',
    topic: 'Differential & Integral Calculus',
    source: 'Senior Batch (Demo)',
    summary: 'Comprehensive calculus notes with solved problems.',
  },
];

export const DEMO_DEADLINES: Deadline[] = [
  {
    id: 'dl-1',
    title: 'Chemistry Assignment — Molecular Bonds',
    courseId: 'chem-1101',
    description: 'Solve problems on MO theory bond order calculations for diatomic molecules.',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    status: 'in-progress',
  },
  {
    id: 'dl-2',
    title: 'Physics Lab Report — Diffraction',
    courseId: 'phy-1101',
    description: 'Complete the lab report on single-slit diffraction experiment.',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    status: 'not-started',
  },
  {
    id: 'dl-3',
    title: 'Math Problem Set — Integration',
    courseId: 'math-1101',
    description: 'Complete exercises on definite integrals and area under curves.',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    status: 'not-started',
  },
];

export const RESOURCE_TYPES = [
  { value: 'lecture-slides', label: 'Lecture Slides' },
  { value: 'senior-notes', label: 'Senior Notes' },
  { value: 'ct-questions', label: 'CT Questions' },
  { value: 'final-questions', label: 'Final Questions' },
  { value: 'lab-manual', label: 'Lab Manual' },
  { value: 'reference', label: 'Reference Material' },
  { value: 'exercises', label: 'Exercises' },
  { value: 'other', label: 'Other' },
];

export function getCourseName(courseId: string): string {
  return COURSES.find(c => c.id === courseId)?.name || courseId;
}

export function getCourse(courseId: string): Course | undefined {
  return COURSES.find(c => c.id === courseId);
}
