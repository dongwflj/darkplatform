//
//  Cell.h
//  DarkClient
//
//  Created by Ewen Dong on 17/6/2.
//
//

#ifndef Cell_h
#define Cell_h

#include "cocos2d.h"

USING_NS_CC;

class Cell : public Sprite {
public:
    Cell();
    static Cell* create(uint32_t nodeId, uint16_t size, double x, double y, uint8_t r, uint8_t g, uint8_t b, uint8_t isVirus, uint8_t isEjected, uint8_t isFood);
    bool init(uint32_t nodeId, uint16_t size, double x, double y, uint8_t r, uint8_t g, uint8_t b, uint8_t isVirus, uint8_t isEjected, uint8_t isFood);
    
    uint32_t _id;
    double _x;
    double _y;
    uint16_t _size;
    uint8_t _r;
    uint8_t _g;
    uint8_t _b;
    uint8_t _isVirus;
    uint8_t _isEjected;
    uint8_t _isFood;
};

#endif /* Cell_h */
