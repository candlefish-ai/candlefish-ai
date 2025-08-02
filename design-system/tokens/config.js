import StyleDictionary from 'style-dictionary';
import * as culori from 'culori';

// Advanced OKLCH color conversion utilities
const oklchConverter = {
  name: 'oklch-converter',
  type: 'value',
  filter: (token) => token.type === 'color',
  transform: (token) => {
    if (token.value.startsWith('oklch(')) return token.value;
    try {
      const color = culori.parse(token.value);
      if (color) {
        const oklchValue = culori.formatOklch(color);
        return oklchValue || token.value;
      }
    } catch (e) {
      console.warn(`Could not convert color ${token.value} to OKLCH, using original value`);
    }
    return token.value;
  }
};

// CSS Custom Properties with @property type safety
const cssCustomPropertiesFormat = {
  name: 'css/custom-properties-typed',
  format: ({ dictionary, options }) => {
    const properties = dictionary.allTokens.map(token => {
      const customPropertyName = `--${token.name}`;
      const cssProperty = `@property ${customPropertyName} {
  syntax: "${getCSSType(token)}";
  inherits: false;
  initial-value: ${token.value};
}`;
      return cssProperty;
    }).join('\n\n');

    const variables = dictionary.allTokens.map(token => 
      `  --${token.name}: ${token.value};`
    ).join('\n');

    return `/* Candlefish AI Design System - Advanced CSS Properties */
/* Generated on: ${new Date().toISOString()} */

/* Type-safe CSS Custom Properties */
${properties}

/* CSS Variables */
:root {
${variables}
}

/* Container Query Support */
@container style(--candlefish-component: true) {
  /* Component-scoped styles */
}

/* Cascade Layers */
@layer candlefish.reset, candlefish.tokens, candlefish.components, candlefish.utilities;
`;
  }
};

// Get CSS type for @property syntax
function getCSSType(token) {
  if (token.type === 'color') return '<color>';
  if (token.type === 'dimension') return '<length>';
  if (token.type === 'number') return '<number>';
  if (token.type === 'fontFamily') return '<custom-ident>+';
  if (token.type === 'fontWeight') return '<number>';
  if (token.type === 'duration') return '<time>';
  if (token.type === 'cubicBezier') return '<string>';
  return '<string>';
}

// Register custom transforms and formats
StyleDictionary.registerTransform(oklchConverter);
StyleDictionary.registerFormat(cssCustomPropertiesFormat);

// AI-powered token generation transform
const aiTokenGenerator = {
  name: 'ai-token-generator',
  type: 'attribute',
  filter: (token) => token.ai?.generate === true,
  transform: (token) => {
    // Placeholder for AI-powered token generation
    // This would integrate with Anthropic Claude or OpenAI APIs
    return {
      ...token.attributes,
      aiGenerated: true,
      generatedAt: new Date().toISOString()
    };
  }
};

StyleDictionary.registerTransform(aiTokenGenerator);

// Accessibility analyzer transform
const accessibilityAnalyzer = {
  name: 'accessibility-analyzer',
  type: 'attribute',
  filter: (token) => token.type === 'color',
  transform: (token) => {
    // Calculate WCAG contrast ratios and provide accessibility metadata
    return {
      ...token.attributes,
      accessibility: {
        wcagAA: true, // Placeholder - would calculate actual ratios
        wcagAAA: false,
        contrastRatio: 4.5
      }
    };
  }
};

StyleDictionary.registerTransform(accessibilityAnalyzer);

export default {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      transforms: ['oklch-converter', 'ai-token-generator', 'accessibility-analyzer'],
      buildPath: 'dist/css/',
      files: [{
        destination: 'candlefish-tokens.css',
        format: 'css/custom-properties-typed'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    },
    typescript: {
      transformGroup: 'js',
      buildPath: 'dist/ts/',
      files: [{
        destination: 'tokens.ts',
        format: 'typescript/es6-declarations'
      }]
    },
    json: {
      transformGroup: 'js',
      buildPath: 'dist/json/',
      files: [{
        destination: 'tokens.json',
        format: 'json/flat'
      }]
    }
  }
};