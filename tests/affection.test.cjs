/**
 * Regression tests for Affection / Intimacy Logic
 */
const { 
  createInitialAffection, 
  clampAffection, 
  addAffection, 
  calculateQuizAffectionGain,
  AFFECTION_LIMITS
} = require('../src/game/affection.js');

console.log("\n--- Made in Maghribal: Affection Logic Tests ---");

// Test: Initial State
try {
  const ids = ['hakima', 'mira', 'dariya'];
  const state = createInitialAffection(ids);
  if (Object.keys(state).length === 3 && state.hakima === 0 && state.mira === 0 && state.dariya === 0) {
    console.log("✅ PASSED: createInitialAffection");
  } else {
    throw new Error("Initial state mismatch");
  }
} catch (e) {
  console.error("❌ FAILED: createInitialAffection", e.message);
  process.exit(1);
}

// Test: Clamping
try {
  if (clampAffection(150) === AFFECTION_LIMITS.MAX && 
      clampAffection(-10) === AFFECTION_LIMITS.MIN && 
      clampAffection(50) === 50) {
    console.log("✅ PASSED: clampAffection");
  } else {
    throw new Error("Clamping logic fail");
  }
} catch (e) {
  console.error("❌ FAILED: clampAffection", e.message);
  process.exit(1);
}

// Test: Add Affection
try {
  const state = { hakima: 10, mira: 0 };
  const next = addAffection(state, 'hakima', 5);
  const nextClamped = addAffection(state, 'hakima', 100);
  
  if (next.hakima === 15 && next.mira === 0 && nextClamped.hakima === 100) {
    console.log("✅ PASSED: addAffection");
  } else {
    throw new Error("Add affection mismatch");
  }
} catch (e) {
  console.error("❌ FAILED: addAffection", e.message);
  process.exit(1);
}

// Test: Unknown ID
try {
  const state = { hakima: 0 };
  const next = addAffection(state, 'unknown', 10);
  if (next.hakima === 0 && !('unknown' in next)) {
    console.log("✅ PASSED: addAffection (unknown ID safety)");
  } else {
    throw new Error("Safety check failed");
  }
} catch (e) {
  console.error("❌ FAILED: addAffection (unknown ID safety)", e.message);
  process.exit(1);
}

// Test: Gain Calculation
try {
  if (calculateQuizAffectionGain(5) === 5 && 
      calculateQuizAffectionGain(0) === 0 && 
      calculateQuizAffectionGain(3) === 3) {
    console.log("✅ PASSED: calculateQuizAffectionGain");
  } else {
    throw new Error("Gain calculation mismatch");
  }
} catch (e) {
  console.error("❌ FAILED: calculateQuizAffectionGain", e.message);
  process.exit(1);
}

console.log("\n--- All affection tests completed successfully! ---");
