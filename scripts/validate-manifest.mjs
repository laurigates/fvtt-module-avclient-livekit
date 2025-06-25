#!/usr/bin/env node

import fs from 'fs';
import { validateModule } from '@typhonjs-fvtt/validate-manifest';

// Get the manifest file path from command line arguments
const manifestPath = process.argv[2] || 'module.json';

try {
  // Read and parse the manifest file
  const manifestText = fs.readFileSync(manifestPath, 'utf8');
  const manifestObject = JSON.parse(manifestText);

  // Validate the manifest
  if (validateModule(manifestObject)) {
    console.log(`✅ ${manifestPath} is valid!`);
    process.exit(0);
  } else {
    console.error(`❌ ${manifestPath} validation failed:`);
    
    // Print validation errors
    if (validateModule.errors && validateModule.errors.length > 0) {
      validateModule.errors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error.instancePath || 'root'}: ${error.message}`);
        if (error.data !== undefined) {
          console.error(`     Current value: ${JSON.stringify(error.data)}`);
        }
        if (error.params) {
          console.error(`     ${JSON.stringify(error.params)}`);
        }
      });
    }
    
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Error validating ${manifestPath}:`);
  
  if (error.code === 'ENOENT') {
    console.error(`  File not found: ${manifestPath}`);
  } else if (error instanceof SyntaxError) {
    console.error(`  Invalid JSON: ${error.message}`);
  } else {
    console.error(`  ${error.message}`);
  }
  
  process.exit(1);
}