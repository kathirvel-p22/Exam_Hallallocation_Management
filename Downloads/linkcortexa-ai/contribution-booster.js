#!/usr/bin/env node

/**
 * GitHub Contribution Booster
 * 
 * This script helps you create meaningful commits to increase your GitHub contributions.
 * It creates a daily journal/log of your learning and development activities.
 * 
 * IMPORTANT: Use this ethically! Make real, meaningful contributions.
 * This is designed to help you build a habit of daily coding and documentation.
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Configuration
const config = {
  repoPath: process.cwd(),
  journalDir: 'daily-journal',
  commitMessage: (date) => `📝 Daily log: ${date}`,
};

// Ensure journal directory exists
function ensureJournalDir() {
  const journalPath = path.join(config.repoPath, config.journalDir);
  if (!fs.existsSync(journalPath)) {
    fs.mkdirSync(journalPath, { recursive: true });
    console.log(`✅ Created journal directory: ${config.journalDir}`);
  }
  return journalPath;
}

// Create daily journal entry
function createDailyEntry() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const timestamp = today.toLocaleString();
  
  const journalPath = ensureJournalDir();
  const fileName = `${dateStr}.md`;
  const filePath = path.join(journalPath, fileName);
  
  // Check if entry already exists
  if (fs.existsSync(filePath)) {
    console.log(`📋 Entry already exists for ${dateStr}`);
    return null;
  }
  
  // Create meaningful content
  const content = `# Daily Development Log - ${dateStr}

**Date:** ${timestamp}

## 🎯 Today's Goals
- [ ] Complete feature development
- [ ] Write tests
- [ ] Update documentation
- [ ] Code review

## 💻 What I Worked On
- 

## 📚 What I Learned
- 

## 🐛 Challenges Faced
- 

## ✅ Accomplishments
- 

## 📝 Notes for Tomorrow
- 

---
*Generated with commitment to daily learning and growth*
`;

  fs.writeFileSync(filePath, content);
  console.log(`✅ Created journal entry: ${fileName}`);
  return filePath;
}

// Commit the changes
function commitChanges(filePath) {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Add file
    execSync(`git add "${filePath}"`, { stdio: 'inherit' });
    
    // Commit
    execSync(`git commit -m "${config.commitMessage(dateStr)}"`, { stdio: 'inherit' });
    
    console.log(`✅ Committed successfully!`);
    console.log(`💡 Don't forget to push: git push origin main`);
    
  } catch (error) {
    console.error('❌ Error committing:', error.message);
    console.log('💡 Make sure you have git initialized and configured');
  }
}

// Main function
function main() {
  console.log('🚀 GitHub Contribution Booster\n');
  
  const filePath = createDailyEntry();
  
  if (filePath) {
    console.log('\n📝 Fill in your daily activities in the journal entry');
    console.log('🔄 Run this command after filling it out:\n');
    console.log(`   node contribution-booster.js commit\n`);
  }
  
  // If 'commit' argument is passed, commit the changes
  if (process.argv[2] === 'commit') {
    const today = new Date().toISOString().split('T')[0];
    const todayFile = path.join(ensureJournalDir(), `${today}.md`);
    
    if (fs.existsSync(todayFile)) {
      commitChanges(todayFile);
    } else {
      console.log('❌ No entry found for today. Run without arguments first.');
    }
  }
}

// Run the script
main();
