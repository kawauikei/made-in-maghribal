/**
 * Image Asset Definitions for Made in Maghribal
 */

export const BACKGROUND_IMAGES = {
  shopExteriorDay: { id: "shopExteriorDay", label: "shop exterior day", src: "images/background/bg_shop_exterior_day.jpeg" },
  shopExteriorNight: { id: "shopExteriorNight", label: "shop exterior night", src: "images/background/bg_shop_exterior_night.jpeg" },
  shopInteriorService: { id: "shopInteriorService", label: "shop interior service", src: "images/background/bg_shop_interior_service.jpeg" },
  marketCentral: { id: "marketCentral", label: "market central", src: "images/background/bg_market_central.jpeg" },
  palaceCorridor: { id: "palaceCorridor", label: "palace corridor", src: "images/background/bg_palace_corridor.jpeg" },
  palaceLab: { id: "palaceLab", label: "palace lab", src: "images/background/bg_palace_lab.jpeg" },
  spotFountain: { id: "spotFountain", label: "spot fountain", src: "images/background/bg_spot_fountain.jpeg" },
  spotFestivalStreet: { id: "spotFestivalStreet", label: "spot festival street", src: "images/background/bg_spot_festival_street.jpeg" },
  spotPortView: { id: "spotPortView", label: "spot port view", src: "images/background/bg_spot_port_view.jpeg" },
  spotOasisView: { id: "spotOasisView", label: "spot oasis view", src: "images/background/bg_spot_oasis_view.jpeg" },
  spotRuins: { id: "spotRuins", label: "spot ruins", src: "images/background/bg_spot_ruins.jpeg" },
  spotStarView: { id: "spotStarView", label: "spot star view", src: "images/background/bg_spot_star_view.jpeg" }
};

export const STILL_IMAGES = {
  hakimaMorningVisit01: { id: "hakimaMorningVisit01", title: "朝の来訪", label: "朝の来訪", heroineId: "hakima", src: "images/still/still_hakima_morning_visit_01.jpeg", focusX: 0.5, focusY: 0.4, stillCrop: { objectPosition: "50% 35%", objectFit: "cover" } },
  hakimaFestivalNight01: { id: "hakimaFestivalNight01", title: "祭りの夜", label: "祭りの夜", heroineId: "hakima", src: "images/still/still_hakima_festival_night_01.jpeg", focusX: 0.5, focusY: 0.5 },
  hakimaMarketArgument01: { id: "hakimaMarketArgument01", title: "市場の小競り合い", label: "市場の小競り合い", heroineId: "hakima", src: "images/still/still_hakima_market_argument_01.jpeg", focusX: 0.5, focusY: 0.5, stillCrop: { mode: "heroine_pan", objectFit: "cover", startPosition: "50% 45%", endPosition: "68% 38%", durationMs: 1200 } },
  hakimaRainShelter01: { id: "hakimaRainShelter01", title: "雨宿り", label: "雨宿り", heroineId: "hakima", src: "images/still/still_hakima_rain_shelter_01.jpeg", focusX: 0.5, focusY: 0.5 },
  miraAfterSchool01: { id: "miraAfterSchool01", title: "放課後", label: "放課後", heroineId: "mira", src: "images/still/still_mira_after_school_01.jpeg", focusX: 0.5, focusY: 0.45, stillCrop: { objectPosition: "50% 40%", objectFit: "cover" } },
  miraAssignmentConsult01: { id: "miraAssignmentConsult01", title: "課題相談", label: "課題相談", heroineId: "mira", src: "images/still/still_mira_assignment_consult_01.jpeg", focusX: 0.5, focusY: 0.5 },
  miraStarryRooftop01: { id: "miraStarryRooftop01", title: "星見の屋上", label: "星見の屋上", heroineId: "mira", src: "images/still/still_mira_starry_rooftop_01.jpeg", focusX: 0.5, focusY: 0.5 },
  miraVisitSick01: { id: "miraVisitSick01", title: "見舞い", label: "見舞い", heroineId: "mira", src: "images/still/still_mira_visit_sick_01.jpeg", focusX: 0.5, focusY: 0.5 },
  dariyaAfterHours01: { id: "dariyaAfterHours01", title: "夜更けの訪問", label: "夜更けの訪問", heroineId: "dariya", src: "images/still/still_dariya_after_hours_01.jpeg", focusX: 0.5, focusY: 0.4 },
  dariyaLimitNight01: { id: "dariyaLimitNight01", title: "限界の夜", label: "限界の夜", heroineId: "dariya", src: "images/still/still_dariya_limit_night_01.jpeg", focusX: 0.5, focusY: 0.5 },
  dariyaPalaceCollaboration01: { id: "dariyaPalaceCollaboration01", title: "王宮との協力", label: "王宮との協力", heroineId: "dariya", src: "images/still/still_dariya_palace_collaboration_01.jpeg", focusX: 0.5, focusY: 0.5 },
  dariyaRainCorridor01: { id: "dariyaRainCorridor01", title: "雨の回廊", label: "雨の回廊", heroineId: "dariya", src: "images/still/still_dariya_rain_corridor_01.jpeg", focusX: 0.5, focusY: 0.5 }
};

export function getBackgroundById(id) {
  return BACKGROUND_IMAGES[id] || null;
}

export function getStillById(id) {
  return STILL_IMAGES[id] || null;
}
