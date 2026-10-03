// Our notes data: an array of note objects
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];
// Search for notes containing a word, ignoring uppercase and lowercase
function searchNotes(word) {
  const searchWord = word.toLowerCase();

  return notes.filter((note) =>
    note.text.toLowerCase().includes(searchWord)
  );
}

// Test searchNotes
console.log(searchNotes("javascript")); // Expected: note 4
console.log(searchNotes("pizza"));      // Expected: []

//Find and return the notes with the most characters
function longestNote() {
  // If there are no notes, return null
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];

  // Compare each note with the current longest note
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }

  return longest;
}

// Test longestNote
console.log(longestNote()); // Expected: note 3

// Test the empty-array edge case
const savedNotes = notes;
notes = [];
console.log(longestNote()); // Expected: null
notes = savedNotes;
// Count how many notes belong to each category
function countByCategory() {
  const counts = {};

  // Go through every note and increase its category count
  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }

  return counts;
}

// Test countByCategory
console.log(countByCategory()); // Expected: { personal: 2, study: 2, work: 1 }

// Test the empty-array edge case
const savedNotesForCount = notes;
notes = [];
console.log(countByCategory()); // Expected: {}
notes = savedNotesForCount;
// Create a short summary of all notes
function getSummary() {
  const counts = countByCategory();

  // Use "note" for exactly one note and "notes" for everything else
  const word = notes.length === 1 ? "note" : "notes";

  return `${notes.length} ${word}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}

// Test getSummary
console.log(getSummary()); // Expected: "5 notes: 2 personal, 1 work, 2 study."

// Test with no notes
const savedNotesForSummary = notes;
notes = [];
console.log(getSummary()); // Expected: "0 notes: 0 personal, 0 work, 0 study."
notes = savedNotesForSummary;
// Check whether a note with the same text already exists
function isDuplicate(text) {
  const cleanedText = text.trim().toLowerCase();

  // Check every note to see if its text matches
  return notes.some((note) =>
    note.text.trim().toLowerCase() === cleanedText
  );
}

// Test isDuplicate
console.log(isDuplicate("  BUY MILK AND BREAD  ")); // Expected: true
console.log(isDuplicate("Buy eggs"));                // Expected: false
// Add a new note only when all validation rules are met
function addNote(text, category) {
  const cleanedText = text.trim();
  const validCategories = ["personal", "work", "study"];

  // Check that the note has 1-200 characters
  if (cleanedText.length === 0 || cleanedText.length > 200) {
    console.log("❌ Note rejected: text must be 1-200 characters.");
    return false;
  }

  // Check that the note is not already in the list
  if (isDuplicate(cleanedText)) {
    console.log("❌ Note rejected: duplicate note.");
    return false;
  }

  // Check that the category is allowed
  if (!validCategories.includes(category)) {
    console.log("❌ Note rejected: invalid category.");
    return false;
  }

  // Create the new note
  const newNote = {
    id: notes.length + 1,
    text: cleanedText,
    category: category,
  };

  // Add the new note to the notes array
  notes.push(newNote);

  console.log(`✅ Note added: "${newNote.text}" (${newNote.category})`);
  return true;
}

// Test addNote with a valid note
console.log(addNote("Learn JavaScript functions", "study")); // Expected: true

// Test addNote with a duplicate note
console.log(addNote("  BUY MILK AND BREAD  ", "personal")); // Expected: false