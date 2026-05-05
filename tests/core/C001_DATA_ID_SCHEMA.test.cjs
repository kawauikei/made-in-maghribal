const test = require('node:test');
const assert = require('node:assert');
const { validateId } = require('../../src/core/idSchema.cjs');

test('C001_DATA_ID_SCHEMA: HeroineId validation', () => {
  assert.strictEqual(validateId('heroineId', 'hakima').ok, true);
  assert.strictEqual(validateId('heroineId', 'mira').ok, true);
  assert.strictEqual(validateId('heroineId', 'dariya').ok, true);
  
  const invalid1 = validateId('heroineId', 'yumi');
  assert.strictEqual(invalid1.ok, false);
  assert.strictEqual(invalid1.reason, "Unknown Heroine ID");

  const invalid2 = validateId('heroineId', 'hakima_extra');
  assert.strictEqual(invalid2.ok, false);
  assert.strictEqual(invalid2.reason, "Format Mismatch");
});

test('C001_DATA_ID_SCHEMA: RouteMode validation', () => {
  assert.strictEqual(validateId('routeMode', 'normal').ok, true);
  assert.strictEqual(validateId('routeMode', 'extra').ok, true);
  
  const invalid1 = validateId('routeMode', 'norml');
  assert.strictEqual(invalid1.ok, false);
  assert.strictEqual(invalid1.reason, "Unknown Route Mode");

  const invalid2 = validateId('routeMode', '');
  assert.strictEqual(invalid2.ok, false);
  assert.strictEqual(invalid2.reason, "ID cannot be empty");
});

test('C001_DATA_ID_SCHEMA: CharacterId validation', () => {
  assert.strictEqual(validateId('characterId', 'CH_NADIR').ok, true);
  assert.strictEqual(validateId('characterId', 'CH_HAKIMA').ok, true);
  
  const invalid1 = validateId('characterId', 'NADIR');
  assert.strictEqual(invalid1.ok, false);
  assert.strictEqual(invalid1.reason, "Missing Prefix");

  const invalid2 = validateId('characterId', 'CH_');
  assert.strictEqual(invalid2.ok, false);
  assert.strictEqual(invalid2.reason, "Name segment is empty");
});

test('C001_DATA_ID_SCHEMA: ExpressionId validation', () => {
  assert.strictEqual(validateId('expressionId', 'joy').ok, true);
  assert.strictEqual(validateId('expressionId', 'anger').ok, true);
  assert.strictEqual(validateId('expressionId', 'maid').ok, true);
  
  const invalid = validateId('expressionId', 'sadness');
  assert.strictEqual(invalid.ok, false);
  assert.strictEqual(invalid.reason, "Unknown Expression ID");
});

test('C001_DATA_ID_SCHEMA: AssetId validation', () => {
  assert.strictEqual(validateId('assetId', 'AS_BG_FOREST').ok, true);
  assert.strictEqual(validateId('assetId', 'AS_UI_BUTTON_OK').ok, true);
  
  const invalid1 = validateId('assetId', 'AS_FOREST');
  assert.strictEqual(invalid1.ok, false);
  assert.strictEqual(invalid1.reason, "Missing Asset Name");

  const invalid2 = validateId('assetId', 'AS_BG_');
  assert.strictEqual(invalid2.ok, false);
  assert.strictEqual(invalid2.reason, "Missing Asset Name");

  const invalid3 = validateId('assetId', 'AS_MAP_FOREST');
  assert.strictEqual(invalid3.ok, false);
  assert.strictEqual(invalid3.reason, "Unknown Category");
});

test('C001_DATA_ID_SCHEMA: ItemId validation', () => {
  assert.strictEqual(validateId('itemId', 'IT_ARM_AS_001').ok, true);
  assert.strictEqual(validateId('itemId', 'IT_FOD_EL_12').ok, true);
  
  const invalid1 = validateId('itemId', 'IT_XYZ_AS_001');
  assert.strictEqual(invalid1.ok, false);
  assert.strictEqual(invalid1.reason, "Unknown Genre ID");

  const invalid2 = validateId('itemId', 'IT_ARM_XX_001');
  assert.strictEqual(invalid2.ok, false);
  assert.strictEqual(invalid2.reason, "Unknown Principle ID");

  const invalid3 = validateId('itemId', 'IT_ARM_AS_');
  assert.strictEqual(invalid3.ok, false);
  assert.strictEqual(invalid3.reason, "Missing Index");
});

test('C001_DATA_ID_SCHEMA: BGM/SE and SceneId validation', () => {
  assert.strictEqual(validateId('bgmId', 'BGM_TOWN_DAY').ok, true);
  assert.strictEqual(validateId('bgmId', 'BGM_UNKNOWN').ok, false);
  assert.strictEqual(validateId('bgmId', 'BGM_UNKNOWN').reason, "Unknown BGM Name");

  assert.strictEqual(validateId('sceneId', 'SC_OP_OPENING').ok, true);
  assert.strictEqual(validateId('sceneId', 'SC_EVENT_BOSS_FIGHT').ok, true);
  
  const invalid = validateId('sceneId', 'SC_INTRO_START');
  assert.strictEqual(invalid.ok, false);
  assert.strictEqual(invalid.reason, "Unknown Scene Category");
});

test('C001_DATA_ID_SCHEMA: Topic/RequestTemplate validation', () => {
  assert.strictEqual(validateId('topicId', 'topic_daily_weather').ok, true);
  assert.strictEqual(validateId('topicId', 'TopicDailyWeather').ok, false);
  assert.strictEqual(validateId('topicId', 'TopicDailyWeather').reason, "Format Mismatch");

  assert.strictEqual(validateId('requestTemplateId', 'request_template_quiz_01').ok, true);
  assert.strictEqual(validateId('requestTemplateId', 'RTQZ_01').ok, false);
  assert.strictEqual(validateId('requestTemplateId', 'RTQZ_01').reason, "Format Mismatch");
});
