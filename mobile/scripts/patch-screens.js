/**
 * Automated patch for react-native-screens
 * Ensures backward compatibility with Expo Go (which expects boolean for fullScreenSwipeEnabled
 * and lacks RNSSafeAreaView native Fabric component) while preserving full native support for dev builds.
 */

const fs = require('fs');
const path = require('path');

// 1. Patch utils for boolean vs OptionalBoolean string
const utilsFiles = [
  path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'src', 'utils.ts'),
  path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'lib', 'module', 'utils.js'),
  path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'lib', 'commonjs', 'utils.js'),
];

const checkAndPatchUtils = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('isExpoGo')) {
    console.log(`[patch-screens] Utils already patched: ${filePath}`);
    return;
  }

  const patchCode = `
  let isExpoGo = false;
  try {
    const Constants = require('expo-constants').default || require('expo-constants');
    isExpoGo =
      Constants.executionEnvironment === 'storeClient' ||
      Constants.appOwnership === 'expo';
  } catch {
    isExpoGo = false;
  }

  if (isExpoGo) {
    return prop;
  }
`;

  content = content.replace(
    /function parseBooleanToOptionalBooleanNativeProp\s*\([^)]*\)\s*\{/,
    (match) => `${match}${patchCode}`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[patch-screens] Utils patched successfully: ${filePath}`);
};

utilsFiles.forEach(checkAndPatchUtils);

// 2. Patch safe-area/SafeAreaView to fallback to View in Expo Go
const safeAreaFiles = [
  path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'src', 'components', 'safe-area', 'SafeAreaView.tsx'),
  path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'lib', 'module', 'components', 'safe-area', 'SafeAreaView.js'),
  path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'lib', 'commonjs', 'components', 'safe-area', 'SafeAreaView.js'),
];

const checkAndPatchSafeArea = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('isExpoGo')) {
    console.log(`[patch-screens] SafeAreaView already patched: ${filePath}`);
    return;
  }

  if (filePath.endsWith('.tsx')) {
    content = content.replace(
      /import \{ StyleSheet \} from 'react-native';/,
      "import { StyleSheet, View } from 'react-native';"
    );
    content = content.replace(
      /export function SafeAreaView\(props: SafeAreaViewProps\) \{/,
      `let isExpoGo = false;
try {
  const Constants = require('expo-constants').default || require('expo-constants');
  isExpoGo =
    Constants.executionEnvironment === 'storeClient' ||
    Constants.appOwnership === 'expo';
} catch {
  isExpoGo = false;
}

export function SafeAreaView(props: SafeAreaViewProps) {
  if (isExpoGo) {
    return <View {...props} style={[styles.flex, props.style]} />;
  }`
    );
  } else if (filePath.includes('module')) {
    content = content.replace(
      /import \{ StyleSheet \} from 'react-native';/,
      "import { StyleSheet, View } from 'react-native';"
    );
    content = content.replace(
      /export function SafeAreaView\(props\) \{/,
      `let isExpoGo = false;
try {
  const Constants = require('expo-constants').default || require('expo-constants');
  isExpoGo =
    Constants.executionEnvironment === 'storeClient' ||
    Constants.appOwnership === 'expo';
} catch {
  isExpoGo = false;
}

export function SafeAreaView(props) {
  if (isExpoGo) {
    return /*#__PURE__*/React.createElement(View, _extends({}, props, {
      style: [styles.flex, props.style]
    }));
  }`
    );
  } else {
    content = content.replace(
      /function SafeAreaView\(props\) \{/,
      `let isExpoGo = false;
try {
  const Constants = require('expo-constants').default || require('expo-constants');
  isExpoGo =
    Constants.executionEnvironment === 'storeClient' ||
    Constants.appOwnership === 'expo';
} catch {
  isExpoGo = false;
}

function SafeAreaView(props) {
  if (isExpoGo) {
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, _extends({}, props, {
      style: [styles.flex, props.style]
    }));
  }`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[patch-screens] SafeAreaView patched successfully: ${filePath}`);
};

safeAreaFiles.forEach(checkAndPatchSafeArea);

// 3. Patch StackHeaderConfigAndroidNativeComponent for React Native Codegen React.ElementRef requirement
const codegenFiles = [
  path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'src', 'fabric', 'gamma', 'stack', 'StackHeaderConfigAndroidNativeComponent.ts'),
];

const checkAndPatchCodegen = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('React.ComponentRef<ComponentType>')) {
    console.log(`[patch-screens] Codegen already patched: ${filePath}`);
    return;
  }

  content = content.replace(
    /viewRef:\s*React\.ComponentRef<ComponentType>/g,
    'viewRef: React.ElementRef<ComponentType>'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[patch-screens] Codegen patched successfully: ${filePath}`);
};

codegenFiles.forEach(checkAndPatchCodegen);

// 4. Patch all 7 C++ updateState call sites for React Native 0.81.5 compatibility
const cppPatchTargets = [
  {
    file: path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'ios', 'tabs', 'bottom-accessory', 'RNSTabsBottomAccessoryShadowStateProxy.mm'),
    pattern: /_bottomAccessoryView\.state->updateState\(\s*std::move\(newState\),\s*facebook::react::EventQueue::UpdateMode::unstable_Immediate\);/g,
    replacement: '_bottomAccessoryView.state->updateState(std::move(newState));',
    name: 'RNSTabsBottomAccessoryShadowStateProxy',
  },
  {
    file: path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'ios', 'RNSScreenStackHeaderSubview.mm'),
    pattern: /_state->updateState\(\s*std::move\(newState\),\s*_synchronousShadowStateUpdatesEnabled\s*\?\s*facebook::react::EventQueue::UpdateMode::unstable_Immediate\s*:\s*facebook::react::EventQueue::UpdateMode::Asynchronous\);/g,
    replacement: '_state->updateState(std::move(newState));',
    name: 'RNSScreenStackHeaderSubview',
  },
  {
    file: path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'ios', 'RNSScreenStackHeaderConfig.mm'),
    pattern: /_state->updateState\(\s*std::move\(newState\),\s*_synchronousShadowStateUpdatesEnabled\s*\?\s*facebook::react::EventQueue::UpdateMode::unstable_Immediate\s*:\s*facebook::react::EventQueue::UpdateMode::Asynchronous\);/g,
    replacement: '_state->updateState(std::move(newState));',
    name: 'RNSScreenStackHeaderConfig',
  },
  {
    file: path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'ios', 'RNSScreen.mm'),
    pattern: /_state->updateState\(\s*std::move\(newState\),\s*_synchronousShadowStateUpdatesEnabled\s*\?\s*facebook::react::EventQueue::UpdateMode::unstable_Immediate\s*:\s*facebook::react::EventQueue::UpdateMode::Asynchronous\);/g,
    replacement: '_state->updateState(std::move(newState));',
    name: 'RNSScreen',
  },
  {
    file: path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'ios', 'safe-area', 'RNSSafeAreaViewComponentView.mm'),
    pattern: /_state->updateState\(\s*std::move\(newData\),\s*facebook::react::EventQueue::UpdateMode::unstable_Immediate\);/g,
    replacement: '_state->updateState(std::move(newData));',
    name: 'RNSSafeAreaViewComponentView',
  },
  {
    file: path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'ios', 'gamma', 'modals', 'form-sheet', 'RNSFormSheetHostShadowStateProxy.mm'),
    pattern: /_state->updateState\(\s*std::move\(newState\),\s*facebook::react::EventQueue::UpdateMode::unstable_Immediate\);/g,
    replacement: '_state->updateState(std::move(newState));',
    name: 'RNSFormSheetHostShadowStateProxy',
  },
  {
    file: path.join(__dirname, '..', 'node_modules', 'react-native-screens', 'ios', 'gamma', 'split', 'RNSSplitScreenShadowStateProxy.mm'),
    pattern: /_state->updateState\(\s*std::move\(newState\),\s*facebook::react::EventQueue::UpdateMode::unstable_Immediate\);/g,
    replacement: '_state->updateState(std::move(newState));',
    name: 'RNSSplitScreenShadowStateProxy',
  },
];

cppPatchTargets.forEach(({ file, pattern, replacement, name }) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('EventQueue::UpdateMode')) {
    console.log(`[patch-screens] ${name} already patched: ${file}`);
    return;
  }

  content = content.replace(pattern, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`[patch-screens] ${name} patched successfully: ${file}`);
});

// 5. Patch expo-router LinkPreviewNativeNavigation.mm for react-native-screens 4.26.2 RNSTabs compatibility
const expoRouterLinkPreviewFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-router',
  'ios',
  'LinkPreview',
  'LinkPreviewNativeNavigation.mm'
);

const checkAndPatchExpoRouter = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already patched
  if (
    content.includes('#import <RNScreens/RNSTabsHostComponentView.h>') &&
    content.includes('#import <RNScreens/RNSTabsScreenComponentView.h>') &&
    !content.includes('RNSBottomTabsHostComponentView') &&
    !content.includes('RNSBottomTabsScreenComponentView') &&
    !content.includes('.tabKey')
  ) {
    console.log(`[patch-screens] LinkPreviewNativeNavigation already patched: ${filePath}`);
    return;
  }

  // 1. Add headers if missing
  if (!content.includes('#import <RNScreens/RNSTabsHostComponentView.h>')) {
    content = content.replace(
      '#import <RNScreens/RNSScreenStack.h>',
      `#import <RNScreens/RNSScreenStack.h>\n#import <RNScreens/RNSTabsHostComponentView.h>\n#import <RNScreens/RNSTabsScreenComponentView.h>`
    );
  }

  // 2. Replace RNSBottomTabsHostComponentView -> RNSTabsHostComponentView
  content = content.replace(/RNSBottomTabsHostComponentView/g, 'RNSTabsHostComponentView');

  // 3. Replace RNSBottomTabsScreenComponentView -> RNSTabsScreenComponentView
  content = content.replace(/RNSBottomTabsScreenComponentView/g, 'RNSTabsScreenComponentView');

  // 4. Replace .tabKey with .screenKey
  content = content.replace(/\.tabKey/g, '.screenKey');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[patch-screens] LinkPreviewNativeNavigation patched successfully: ${filePath}`);
};

checkAndPatchExpoRouter(expoRouterLinkPreviewFile);

