//
//  Cell.cpp
//  DarkClient
//
//  Created by Ewen Dong on 17/6/6.
//
//

#include <Cell.h>

Cell::Cell() {

}

Cell* Cell::create(uint32_t nodeId, uint16_t size, double x, double y, uint8_t r, uint8_t g, uint8_t b, uint8_t isVirus, uint8_t isEjected, uint8_t isFood) {
    Cell * cell = new Cell();
    if (cell && cell->init(nodeId, size, x, y, r, g, b, isVirus, isEjected, isFood))
    {
        cell->autorelease();
        return cell;
    }
    CC_SAFE_DELETE(cell);
    return nullptr;
}

bool Cell::init(uint32_t nodeId, uint16_t size, double x, double y, uint8_t r, uint8_t g, uint8_t b, uint8_t isVirus, uint8_t isEjected, uint8_t isFood) {
    _id = nodeId;
    _size = size;
    _x = x;
    _y = y;
    _r = r;
    _g = g;
    _b = b;
    
    _isVirus = isVirus;
    _isEjected = isEjected;
    _isFood = isFood;
    
    if (_isFood) {
        int type = rand() % 4 + 3;
        int color = rand() % 6 + 1;
        std::string path = StringUtils::format("mainScene/bean_polygon%d_%d.png", type, color);
        if (!Cell::initWithFile(path))
        {
            return false;
        }
    }
    else if (_isVirus) {
        if (!Cell::initWithFile("mainScene/prick.png"))
        {
            return false;
        }
    }
    else if (_isEjected) {
        
    }
    else {
        // Player
        int num = rand() % 8 + 1;
        std::string player = StringUtils::format("mainScene/keyword_%d.png", num);
        if (!Cell::initWithFile(player))
        {
            return false;
        }
    }
    setPosition(Vec2(x, y));
    return true;
}
