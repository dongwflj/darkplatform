//
//  Cell.cpp
//  DarkClient
//
//  Created by Ewen Dong on 17/6/6.
//
//

#include <Cell.h>

#include "../../Common/CommonDefine.h"

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
    _x = _ox = x;
    _y = _oy = y;
    _r = r;
    _g = g;
    _b = b;
    _size = _osize = size;
    
    _isVirus = isVirus;
    _isEjected = isEjected;
    _isFood = isFood;
    
    if (_isFood) {
        int type = rand() % 4 + 3;
        int color = rand() % 6 + 1;
        std::string path = StringUtils::format("gameScene/bean_polygon%d_%d.png", type, color);
        if (!Cell::initWithFile(path))
        {
            return false;
        }
        _current_layer = LAYER_FOOD_Z;
    }
    else if (_isVirus) {
        if (!Cell::initWithFile("gameScene/prick.png"))
        {
            return false;
        }
        _current_layer = LAYER_VIRUS_Z;
    }
    else if (_isEjected) {
        if (!Cell::initWithFile("gameScene/spore_1.png"))
        {
            return false;
        }
        _current_layer = LAYER_SPRITE_Z;
    }
    else {
        // Player
        int num = (_r + _g + _b + 1000) % 8 + 1;
        std::string player = StringUtils::format("gameScene/keyword_%d.png", num);
        if (!Cell::initWithFile(player))
        {
            return false;
        }
        _current_layer = LAYER_SPRITE_Z;
    }
    Rect rect = getBoundingBox();
    _scale_factor = 2 / ((rect.size.width + rect.size.height) / 2.0);
    setScale(size * _scale_factor);
    setPosition(Vec2(x, y));
    setAnchorPoint(Point(0.5,0.5));

    return true;
}

void Cell::updatePos(long long timestamp) {
    if(!_isFood) {
        double step = (timestamp - _timeStamp) / 120.0;
        step = step < 0 ? 0 : step > 1 ? 1 : step;
        _x = step * (_nx - _ox) + _ox;
        _y = step * (_ny - _oy) + _oy;
        _size = step * (_nsize - _osize) + _osize;
    }
}

void Cell::setDisplayName(std::string & name) {
    _nameLabel = Label::createWithTTF(name.c_str(), "fonts/arial.ttf", 50);
    Size size = this->getContentSize();
    _nameLabel->setPosition(Vec2(size.width / 2, size.height / 2));
    Color4B color = Color4B(_r, _g, _b, 200);
    _nameLabel->setTextColor(color);
    this->addChild(_nameLabel, LAYER_SPRITE_Z);
}
