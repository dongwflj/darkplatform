#include <cmath>
#include <algorithm>

#include "../../Common/CommonDefine.h"
#include "../../Transport/Transport.h"
#include "GameLayer.h"

//#include "Tools/Joystick/Joystick.h"
//#include "Entity/Entity.h"
//#include "Entity/Bean.h"
//#include "Entity/Spore.h"
//#include "Entity/Player.h"
//#include "Entity/Prick.h"
//#include "Entity/PlayerDivision.h"
///#include "../SceneManager.h"


GameLayer::GameLayer()
{
}

GameLayer::~GameLayer()
{
}

bool GameLayer::init() {
	if (!Layer::init())
	{
		return false;
	}
    
    _transport = Transport::getInstance();
    _transport->setObserver(this);
    
    auto colorLayer = LayerColor::create(Color4B(49, 49, 49, 255), DESIGN_SCREEN_WIDTH, DESIGN_SCREEN_HEIGHT);
    this->addChild(colorLayer, LAYER_BACKGROUND_Z);
    
    auto listener = EventListenerTouchOneByOne::create();
    listener->setSwallowTouches(true);
    listener->onTouchBegan = CC_CALLBACK_2(GameLayer::onTouchBegan, this);
    listener->onTouchMoved = CC_CALLBACK_2(GameLayer::onTouchMoved, this);
    listener->onTouchEnded = CC_CALLBACK_2(GameLayer::onTouchEnded, this);
    listener->onTouchCancelled = CC_CALLBACK_2(GameLayer::onTouchCancelled, this);
    
    _eventDispatcher->addEventListenerWithSceneGraphPriority(listener, this);
    
    /// Design size fit to actual screen rate: 800*450
    _visibleSize = Director::getInstance()->getVisibleSize();
    _halfVisibleWidth = _visibleSize.width / 2;
    _halfVisibleHeight = _visibleSize.height / 2;
    ///auto winSize = Director::getInstance()->getWinSize();
    Vec2 origin = Director::getInstance()->getVisibleOrigin();
    
    auto right = _visibleSize.width - 150;
    auto divideItem = CheckBox::create(
                                       "mainScene/divide_btn.png",
                                       "mainScene/divide_btn.png");
    divideItem->setPosition(Vec2(right, origin.y + 150));
    divideItem->setScale(3.0f);
    divideItem->addEventListener(CC_CALLBACK_2(GameLayer::onMenuDivide, this));
    this->addChild(divideItem, LAYER_JOYSTICK_Z);

    right -= 250;

    auto spitItem = Button::create(
                                     "mainScene/spit_btn.png",
                                     "mainScene/spit_btn.png");
    spitItem->setPosition(Vec2(right, origin.y + 150));
    spitItem->setScale(3.0f);
    spitItem->addTouchEventListener(CC_CALLBACK_2(GameLayer::onMenuSpit,this));
    ///spitItem->addEventListener(CC_CALLBACK_2(GameLayer::onMenuSpit, this));
    this->addChild(spitItem, LAYER_JOYSTICK_Z);

    
    _map = Node::create();
    //_map->setContentSize(Size(MAP_WIDTH, MAP_HEIGHT));
    this->addChild(_map, LAYER_MAP_Z);
    
//    for (int i = 0; i < 20; i++) {
//        auto cell = Cell::create(0, 4, i*100, 10, 1, 1, 1, 1, 0, 0);
//        this->addChild(cell);
//        auto cell1 = Cell::create(0, 4, 10, (i+1)*100, 1, 1, 1, 1, 0, 0);
//        this->addChild(cell1);
//        auto cell2 = Cell::create(0, 4, 200+i*10, 400, 1, 1, 1, 1, 0, 0);
//        this->addChild(cell2);
//        auto cell3 = Cell::create(0, 4, 400, 200+(i+1)*10, 1, 1, 1, 1, 0, 0);
//        this->addChild(cell3);
//    }
    //cell->setAnchorPoint(Vec2(0, 0));
//    auto cell1 = Cell::create(0, 1, -58.5, 100, 1, 1, 1, 1, 0, 0);
//    _map->addChild(cell1);
//    cell1->setScale(2);
//    _map->setPosition(Vec2(_halfVisibleWidth, _halfVisibleHeight));
    //_map->setScale(0.5);
    //_map->setPosition(-50, -50);
    _networkStatusLabel = Label::createWithTTF("Initial", "fonts/arial.ttf", 30);
    _networkStatusLabel->setPosition(origin.x, _visibleSize.height - 50);
    _networkStatusLabel->setAnchorPoint(Vec2(0, 0));
    Color4B color = Color4B(0, 255, 0, 200);
    _networkStatusLabel->setTextColor(color);
    _networkStatusLabel->setAlignment(cocos2d::TextHAlignment::LEFT);
    this->addChild(_networkStatusLabel, LAYER_INFO_Z);
    
    _drawNode = DrawNode::create();
    _map->addChild(_drawNode, LAYER_SPRITE_Z);
    _viewScale = 1;
    
//    _drawNode->drawDot(Vec2(413, 413), 200, Color4F::RED);
//    _drawNode->setScale(0.8);
//    this->addChild(_drawNode, LAYER_INFO_Z);
//    Rect rect = _drawNode->getBoundingBox();
    this->scheduleUpdate();
	return true;
}

void GameLayer::onOpen() {
    _networkStatusLabel->setString("Connected");
    _transport->sendLogin();
    _transport->sendJoin("Ewen");
}

void GameLayer::onMessage(char* bytes) {
    int offset = 0;
    uint8_t cmd = bytes[offset++];
    switch (cmd) {
        case 16:
            ///log("Recv update node cmd");
            // update nodes
            updateNode(bytes);
            break;
        case 17:
            log("Recv update position");
            // update position
            break;
        case 18:
            // clear nodes
            log("Recv clear all cmd");
            break;
        case 21:
            // draw lin
            log("Recv draw line cmd");
            break;
        case 32:
        {
            log("Recv add node cmd");
            // add Node
            uint32_t* nodeId = (uint32_t*)(bytes + offset);
            _nodesOnScreen.push_back(*nodeId);
            break;
        }
        case 48:
            // Update LB cust text
            break;
        case 49:
            // Update LB ffa
            break;
        case 50:
            // Update LB team
            break;
        case 64:
        {
            // set border
            log("Recv set border cmd");
            double* pDouble;
            
            pDouble = (double*)(bytes + offset);
            _left = *pDouble;
            offset += 8;
            pDouble = (double*)(bytes + offset);
            _top = *pDouble;
            offset += 8;
            pDouble = (double*)(bytes + offset);
            _right = *pDouble;
            offset += 8;
            pDouble = (double*)(bytes + offset);
            _bottom = *pDouble;
            _viewCenterX = _playerX = (_right + _left) / 2;
            _viewCenterY = _playerY = (_bottom + _top) / 2;
            _playerScale = 1;
            log("Setborder left:%f, right:%f, bottom:%f, top:%f", _left, _right, _bottom, _top);
            break;
        }
        case 99:
        {
            // add chat
            uint8_t flag = (uint8_t)bytes[offset++];
            log("Chat message flag:%d", flag);
            uint8_t r = (uint8_t)bytes[offset++];
            uint8_t g = (uint8_t)bytes[offset++];
            uint8_t b = (uint8_t)bytes[offset++];
            log("r:%d, g:%d, b:%d", r, g, b);
            string name = getString(bytes+offset);
            log("Recv chat: %s", name.c_str());
            break;
        }
        default:
            log("Unknown cmd recved");
    }
}

void GameLayer::onClose() {
    _networkStatusLabel->setString("Network closed");
    _transport->open();
}

void GameLayer::onError() {
    _networkStatusLabel->setString("Network error");
    _transport->open();
}

void GameLayer::update(float dt) {
    auto timestamp = utils::getTimeInMilliseconds();
    ///log("Frame update call interval:%lld", timestamp);
    for( auto item : _nodes)
    {
        auto cell = item.second;
        if (!cell->_isFood && !cell->_isVirus) {
            cell->updatePos(timestamp);
            cell->setScale(cell->_size * cell->_scale_factor);
            cell->setPosition(cell->_x, cell->_y);
            // Ensure cell is over virus or hide in virus
            if (cell->_size >= 100 && cell->_current_layer == LAYER_SPRITE_Z) {
                _map->reorderChild(cell, LAYER_BIGSPRITE_Z);
            }
            else if (cell->_size < 100 && cell->_current_layer == LAYER_BIGSPRITE_Z) {
                _map->reorderChild(cell, LAYER_SPRITE_Z);
            }
        }
    }

    if (_playerCells.size() > 0) {
        double x = 0, y = 0;
        float totalSize = 0;
        for (int i=0; i<_playerCells.size(); i++) {
            x += _playerCells.at(i)->_x;
            y += _playerCells.at(i)->_y;
            totalSize += _playerCells.at(i)->_size;
        }
        _playerX = x / _playerCells.size();
        _playerY = y / _playerCells.size();
        _viewCenterX = (_viewCenterX + _playerX) / 2;
        _viewCenterY = (_viewCenterY + _playerY) / 2;
        totalSize = totalSize / _playerCells.size();
        
        float newViewScale;
        newViewScale = 64 / totalSize;
        newViewScale = newViewScale < 1 ? std::pow(newViewScale, 0.4) : 1;
        _viewScale = (9 * _viewScale + newViewScale) / 10;
        log("View scale:%f", _viewScale);
        _map->setScale(_viewScale);
        _map->setPosition(_halfVisibleWidth - _viewCenterX*_viewScale, _halfVisibleHeight - _viewCenterY*_viewScale);
        // need solve line interect issue
//        if (_viewCenterX + _halfVisibleWidth > _right) {
//            _drawNode->drawSegment(Vec2(_right, (_viewCenterY - _halfVisibleHeight)/_viewScale),
//                                   Vec2(_right, (_viewCenterY + _halfVisibleHeight)/_viewScale),
//                                   1, Color4F::RED);
//        }
//        if (_viewCenterX - _halfVisibleWidth < _left) {
//            _drawNode->drawSegment(Vec2(_left, (_viewCenterY - _halfVisibleHeight)/_viewScale),
//                                   Vec2(_left, (_viewCenterY + _halfVisibleHeight)/_viewScale),
//                                   1, Color4F::RED);
//        }
//        if (_viewCenterY + _halfVisibleHeight > _top) {
//            _drawNode->drawSegment(Vec2((_viewCenterX - _halfVisibleWidth)/_viewScale, _top),
//                                   Vec2((_viewCenterX + _halfVisibleWidth)/_viewScale, _top),
//                                   1, Color4F::RED);
//        }
//        if (_viewCenterY - _halfVisibleHeight < _bottom) {
//            _drawNode->drawSegment(Vec2((_viewCenterX - _halfVisibleWidth)/_viewScale, _bottom),
//                                   Vec2((_viewCenterX + _halfVisibleWidth)/_viewScale, _bottom),
//                                   1, Color4F::RED);
//        }
    }
}

void GameLayer::updateNode(char* bytes) {
    auto timestamp = utils::getTimeInMilliseconds();
    ///log("Updatenode call interval:%lld", timestamp);
    int offset = 1;
    // EatItem
    uint16_t eatItemsLen = *(uint16_t*)(bytes+offset);
    ///log("Eat len:%d", eatItemsLen);
    offset += 2;
    uint32_t killerId;
    uint32_t killedId;
    for (int i=0; i < eatItemsLen; ++i) {
        killerId = *(uint32_t*)(bytes+offset);
        killedId = *(uint32_t*)(bytes+offset+4);
        Cell* cell = _nodes.at(killedId);
        offset+=8;
        if (killerId != 0 && cell != NULL) {
            destroy(cell);
//            Vector<Cell*>::iterator iter = _playerCells.find(cell);
//            if (iter != _playerCells.end()) {
//                _playerCells.erase(iter);
//            }
//            _nodes.erase(killedId);
//            cell->removeFromParentAndCleanup(true);
        }
    }
    // UpdateItem
    uint32_t nodeId;
    int32_t x, y;
    int16_t size;
    uint8_t flags, flagVirus, flagEjected, flagAgitated, r, g, b;
    do {
        nodeId = *(uint32_t*)(bytes+offset);
        offset += 4;
        if (nodeId == 0) break;
        x = *(int32_t*)(bytes+offset);
        offset += 4;
        y = *(int32_t*)(bytes+offset);
        offset += 4;
        size = *(int16_t*)(bytes+offset);
        offset += 2;
        r = *(uint8_t*)(bytes+offset);
        offset++;
        g = *(uint8_t*)(bytes+offset);
        offset++;
        b = *(uint8_t*)(bytes+offset);
        offset++;
        
        flags = *(uint8_t*)(bytes+offset);
        offset++;
        flagVirus = flags & 0x01;
        flagAgitated = flags & 0x10;
        flagEjected = flags & 0x20;
        
        if (flags & 4) {
            uint8_t skin;
            for(;;) {
                skin = *(uint8_t*)(bytes+offset) & 0x7F;
                offset++;
                if (skin == 0) break;
            }
        }
        string name;
        uint16_t unicodechar;
        do {
            unicodechar = *(uint16_t*)(bytes+offset);
            offset += 2;
            name += (char)(unicodechar);
        } while (unicodechar != 0);
//        for (uint16_t nick;;) {
//            nick = *(uint16_t*)(bytes+offset);
//            offset += 2;
//            if (nick == 0) break;
//        }
        Cell* cell = NULL;
        if (_nodes.at(nodeId) != NULL) {
            cell = _nodes.at(nodeId);
            cell->updatePos(timestamp);
            cell->_osize = cell->_size;
            cell->_ox = cell->_x;
            cell->_oy = cell->_y;
            
            cell->_r = r;
            cell->_g = g;
            cell->_b = b;
            
            cell->_isVirus = flagVirus;
            cell->_isEjected = flagEjected;
            cell->_isFood = flagAgitated;
        }
        else {
            cell = Cell::create(nodeId, size, x, y, r, g, b, flagVirus, flagEjected, flagAgitated);
            _map->addChild(cell, cell->_current_layer);
            if (name.length() > 0) {
                cell->setDisplayName(name);
            }
            _nodes.insert(nodeId, cell);
        }
        cell->_nx = x;
        cell->_ny = y;
        cell->_nsize = size;
        cell->_timeStamp = timestamp;
        vector<uint32_t>::iterator iter = find(_nodesOnScreen.begin(), _nodesOnScreen.end(), nodeId);
        if (iter != _nodesOnScreen.end()) {
            Vector<Cell*>::iterator iter2 = find(_playerCells.begin(), _playerCells.end(), cell);
            if (iter2 == _playerCells.end()) {
                _playerCells.pushBack(cell);
                if (_playerCells.size() == 1) {
                    _viewCenterX = _playerX = cell->_x;
                    _viewCenterY = _playerY = cell->_y;
                    log("Player initial pos:%f, %f", _playerX, _playerY);
                    _networkStatusLabel->setString("Playing");
//                    _drawNode->drawDot(Vec2(_playerX, _playerY), 500, Color4F::RED);
//                    _map->setPosition(Vec2(_visibleSize.width/2 - _viewCenterX*_viewScale, _visibleSize.height/2 - _viewCenterY*_viewScale));
//                    double x = _playerX;
//                    double y = _playerY;
//                    float s = 0.8;
//                    float r = 200;
//                    _drawNode->drawDot(Vec2(x, y), r, Color4F::RED);
//
//                    _map->setPosition(Vec2(_visibleSize.width/2 - x*s, _visibleSize.height/2 - y*s));
                }
            }
        }
    } while (true);
    
    // Removed Item
    uint16_t removedItemsLen = *(uint16_t*)(bytes+offset);
    std::vector<uint32_t> vecRemovedItemlist;
    offset += 4;
    for (int i = 0; i < removedItemsLen; i++) {
        uint32_t nodeId = *(uint32_t*)(bytes+offset);
        offset += 4;
        Cell* removedCell = _nodes.at(nodeId);
        if (NULL != removedCell) {
            destroy(removedCell);
        }
    }
}

string GameLayer::getString(char* buffer) {
    string text;
    
    uint16_t* unicodechar;
    int offset = 0;
    do {
        unicodechar = (uint16_t*)(buffer+offset);
        offset += 2;
        text += (char)(*unicodechar);
    } while (*unicodechar != 0);
    return text;
}

void GameLayer::onMenuSpit(Ref * pSender, Widget::TouchEventType type) {
    switch (type)
    {
        case Widget::TouchEventType::BEGAN:
            if (_playerCells.size() > 0) {
                _transport->sendAction(21);
                this->schedule(schedule_selector(GameLayer::SpitUpdate),0.2f);
            }
            break;
            
        case Widget::TouchEventType::ENDED:
            this->unschedule(schedule_selector(GameLayer::SpitUpdate));
            break;
            
        case Widget::TouchEventType::CANCELED:
            this->unschedule(schedule_selector(GameLayer::SpitUpdate));
            break;
            
        default:
            break;
    }
}

void GameLayer::SpitUpdate(float dt){
    _transport->sendAction(21);
}

void GameLayer::onMenuDivide(Ref * pSender, CheckBox::EventType type) {
    _transport->sendAction(17);
}

bool GameLayer::onTouchBegan(Touch * touch, Event * event)
{
    _leftTouchStartPos = touch->getLocation();
    _leftVector.set(0, 0);
//    _transport->sendMove(-(_playerX + position.x), -(_playerY + position.y));
//    _joystick->setPosition(position);
//    _joystick->setVisible(true);
//    
//    _joystick->onTouchBegan(touch, event);
    
    return true;
}

void GameLayer::onTouchMoved(Touch * touch, Event * event)
{
    _leftVector = touch->getLocation();
    _leftVector -= _leftTouchStartPos;
    //_transport->sendMove(_leftVector.x*3+_viewCenterX, _leftVector.y*3+_viewCenterY);
    _transport->sendMove(_leftVector.x*3, _leftVector.y*3);
    log("Send move x:%f,y:%f", _leftVector.x, _leftVector.y);
//    _joystick->onTouchMoved(touch, event);
//    _player->setVelocity(/_joystick->getVelocity());
}

void GameLayer::onTouchEnded(Touch * touch, Event * event)
{
    Vec2 endPosition = touch->getLocation();
    Vec2 delta = endPosition - _leftTouchStartPos;
    if (endPosition.distance(_leftTouchStartPos) < 5) {
        _transport->sendMove(0, 0);
    }
    _leftVector.set(0, 0);
//    _joystick->onTouchEnded(touch, event);
//    _joystick->setVisible(false);
//    Vec2 velocity = _joystick->getVelocity();
//    if (velocity.x == 0 && velocity.y == 0)
//    {
//        _player->setConcentrate();
//        synPlayerConcentrate();
//    }
}

void GameLayer::onTouchCancelled(Touch * touch, Event * event)
{
//    _joystick->onTouchCancelled(touch, event);
}

void GameLayer::destroy(Cell* cell) {
    Vector<Cell*>::iterator iter = _playerCells.find(cell);
    if (iter != _playerCells.end()) {
        _playerCells.erase(iter);
        if (_playerCells.size() == 0) {
            _networkStatusLabel->setString("Dead");
            ///_transport->sendLogin();
            _transport->sendJoin("Ewen");
        }
    }
    _nodes.erase(cell->_id);
    cell->removeFromParentAndCleanup(true);
}
