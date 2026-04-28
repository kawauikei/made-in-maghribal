/**
 * Image Asset Definitions for Made in Maghribal
 */

export const BACKGROUND_IMAGES = {
  shopExteriorDay: {
    id: "shopExteriorDay",
    label: "星瓶堂 店構え（昼）",
    src: "images/background/bg_shop_exterior_day.jpg"
  },
  shopExteriorNight: {
    id: "shopExteriorNight",
    label: "星瓶堂 店構え（夜）",
    src: "images/background/bg_shop_exterior_night.jpg"
  },
  shopInteriorService: {
    id: "shopInteriorService",
    label: "星瓶堂 店内（接客）",
    src: "images/background/bg_shop_interior_service.jpg"
  },
  shopInteriorWorkshop: {
    id: "shopInteriorWorkshop",
    label: "星瓶堂 店内（工房）",
    src: "images/background/bg_shop_interior_workshop.jpg"
  },
  universityCourtyard: {
    id: "universityCourtyard",
    label: "錬金大学 中庭",
    src: "images/background/bg_university_courtyard.jpg"
  },
  nadirRoom: {
    id: "nadirRoom",
    label: "ナディールの自室",
    src: "images/background/bg_nadir_room.jpg"
  },
  hakimaRoom: {
    id: "hakimaRoom",
    label: "ハキーマの自室",
    src: "images/background/bg_hakima_room.jpg"
  },
  miraRoom: {
    id: "miraRoom",
    label: "ミラの自室",
    src: "images/background/bg_mira_room.jpg"
  },
  dariyaRoom: {
    id: "dariyaRoom",
    label: "ダリヤの私室",
    src: "images/background/bg_dariya_room.jpg"
  },
  marketCentral: {
    id: "marketCentral",
    label: "マグリバル中央市場",
    src: "images/background/bg_market_central.jpg"
  },
  palaceCorridor: {
    id: "palaceCorridor",
    label: "王宮の回廊",
    src: "images/background/bg_palace_corridor.jpg"
  },
  palaceLab: {
    id: "palaceLab",
    label: "王宮錬金局",
    src: "images/background/bg_palace_lab.jpg"
  },
  spotFountain: {
    id: "spotFountain",
    label: "大噴水広場",
    src: "images/background/bg_spot_fountain.jpg"
  },
  spotFestivalStreet: {
    id: "spotFestivalStreet",
    label: "夜祭りの通り",
    src: "images/background/bg_spot_festival_street.jpg"
  },
  spotPortView: {
    id: "spotPortView",
    label: "海港都市の展望通り",
    src: "images/background/bg_spot_port_view.jpg"
  },
  spotOasisView: {
    id: "spotOasisView",
    label: "砂漠のオアシス展望地",
    src: "images/background/bg_spot_oasis_view.jpg"
  },
  spotRuins: {
    id: "spotRuins",
    label: "古代錬金遺跡",
    src: "images/background/bg_spot_ruins.jpg"
  },
  spotStarView: {
    id: "spotStarView",
    label: "星見の屋上",
    src: "images/background/bg_spot_star_view.jpg"
  }
};

export const STILL_IMAGES = {
  hakimaMorningVisit01: {
    id: "hakimaMorningVisit01",
    label: "朝の押しかけ訪問",
    heroineId: "hakima",
    src: "images/still/still_hakima_morning_visit_01.jpg"
  },
  miraAfterSchool01: {
    id: "miraAfterSchool01",
    label: "放課後の店番",
    heroineId: "mira",
    src: "images/still/still_mira_after_school_01.jpg"
  },
  dariyaAfterHours01: {
    id: "dariyaAfterHours01",
    label: "閉店後の来訪",
    heroineId: "dariya",
    src: "images/still/still_dariya_after_hours_01.jpg"
  },
  groupShopping01: {
    id: "groupShopping01",
    label: "4人で買い出し",
    heroineId: null,
    src: "images/still/still_group_shopping_01.jpg"
  }
};

/**
 * Helper to get background by ID
 * @param {string} id 
 * @returns {object|null}
 */
export function getBackgroundById(id) {
  return BACKGROUND_IMAGES[id] || null;
}

/**
 * Helper to get still by ID
 * @param {string} id 
 * @returns {object|null}
 */
export function getStillById(id) {
  return STILL_IMAGES[id] || null;
}
