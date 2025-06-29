/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getGitConfig(key, fallback = '') {
  try {
    return execSync(`git config --get ${key}`, { encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

function getGitRemoteInfo() {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    
    // Parse GitHub URL (supports both SSH and HTTPS formats)
    const sshMatch = remoteUrl.match(/git@github\.com:(.+?)\/(.+?)(?:\.git)?$/);
    const httpsMatch = remoteUrl.match(/https:\/\/github\.com\/(.+?)\/(.+?)(?:\.git)?$/);
    
    if (sshMatch) {
      return { username: sshMatch[1], repository: sshMatch[2] };
    } else if (httpsMatch) {
      return { username: httpsMatch[1], repository: httpsMatch[2] };
    }
  } catch {
    console.warn('Could not parse git remote URL');
  }
  
  return { username: 'bekriebel', repository: 'fvtt-module-avclient-livekit' };
}

function getPackageVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    return packageJson.version || '0.5.32';
  } catch {
    console.warn('Could not read package.json version');
    return '0.5.32';
  }
}

function getReplacements() {
  // Get dynamic values
  const gitInfo = getGitRemoteInfo();
  const packageVersion = getPackageVersion();
  
  // Define replacement values with fallbacks to original repo values
  return {
    GITHUB_USERNAME: process.env.GITHUB_USERNAME || gitInfo.username,
    GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY || gitInfo.repository,
    MODULE_VERSION: process.env.MODULE_VERSION || packageVersion,
    AUTHOR_NAME: process.env.AUTHOR_NAME || getGitConfig('user.name', 'bekit'),
    AUTHOR_EMAIL: process.env.AUTHOR_EMAIL || getGitConfig('user.email', 'fvtt-module-help@bekit.net'),
    AUTHOR_DISCORD: process.env.AUTHOR_DISCORD || 'bekit#4213',
    AUTHOR_PATREON: process.env.AUTHOR_PATREON || 'bekit',
    AUTHOR_KOFI: process.env.AUTHOR_KOFI || 'bekit',
    AUTHOR_TWITTER: process.env.AUTHOR_TWITTER || '@bekit'
  };
}

function processTemplateToString() {
  const templatePath = path.join(__dirname, '..', 'module.json.template');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error('module.json.template not found');
  }
  
  let template = fs.readFileSync(templatePath, 'utf8');
  const replacements = getReplacements();
  
  // Replace all placeholders
  Object.entries(replacements).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(placeholder, value);
  });
  
  console.log('Generated module.json with the following values:');
  Object.entries(replacements).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  return template;
}

function processTemplate() {
  const outputPath = path.join(__dirname, '..', 'dist', 'module.json');
  const template = processTemplateToString();
  
  // Ensure output directory exists
  const distDir = path.dirname(outputPath);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Write processed template
  fs.writeFileSync(outputPath, template, 'utf8');
}

module.exports = { processTemplate, processTemplateToString };

// If called directly, process the template
if (require.main === module) {
  try {
    processTemplate();
    console.log('✓ module.json generated successfully');
  } catch (error) {
    console.error('✗ Error processing template:', error.message);
    process.exit(1);
  }
}