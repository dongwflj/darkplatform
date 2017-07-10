//
//  CommonDefine.h
//  DarkClient
//
//  Created by Ewen Dong on 17/6/2.
//
//

#ifndef CommonDefine_h
#define CommonDefine_h

#define DESIGN_SCREEN_WIDTH 1920
#define DESIGN_SCREEN_HEIGHT 1080

#define MAP_WIDTH 14142
#define MAP_HEIGHT 14142

// Player and Prick
#define START_SIZE 31.6227
#define PRICK_SIZE 100
// pic radius 58.5, so 31.6227/58.5 is the pic scale, factor=31.6227/58.5/31.6227 = 0.01707= 1/58.5
//#define SCALE_FACOTR 0.01707634
//// 1/16
//#define FOOD_SCALE_FACOTR 0.0625
//// 1/128
//#define SPORE_SCALE_FACOTR 0.0625

enum GameLayerZOrder
{
    LAYER_BACKGROUND_Z,
    LAYER_MAP_Z,
    LAYER_FOOD_Z,
    LAYER_SPRITE_Z,
    LAYER_VIRUS_Z,
    LAYER_BIGSPRITE_Z,
    LAYER_INFO_Z,
    LAYER_JOYSTICK_Z
};

#endif /* CommonDefine_h */
