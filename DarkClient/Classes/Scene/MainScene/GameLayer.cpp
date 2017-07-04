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

enum GameLayerZOrder
{
	LAYER_BACKGROUND_Z,
	LAYER_MAP_Z,
	LAYER_SPRITE_Z,
	LAYER_JOYSTICK_Z
};

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
    
    /// Design size fit to actual screen rate: 800*450
    auto visibleSize = Director::getInstance()->getVisibleSize();
    ///auto winSize = Director::getInstance()->getWinSize();
    Vec2 origin = Director::getInstance()->getVisibleOrigin();
    
    auto right = visibleSize.width - 150;
    auto divideItem = CheckBox::create(
                                       "mainScene/divide_btn.png",
                                       "mainScene/divide_btn.png");
    divideItem->setPosition(Vec2(right, origin.y + 150));
    ///divideItem->setZoomScale(0.01f);
    divideItem->addEventListener(CC_CALLBACK_2(GameLayer::onMenuDivide, this));
    this->addChild(divideItem, LAYER_JOYSTICK_Z);

    right -= 250;

    auto spitItem = CheckBox::create(
                                     "mainScene/spit_btn.png",
                                     "mainScene/spit_btn.png");
    spitItem->setPosition(Vec2(right, origin.y + 150));
    ///spitItem->setZoomScale(100.0f);
    spitItem->addEventListener(CC_CALLBACK_2(GameLayer::onMenuSpit, this));
    this->addChild(spitItem, LAYER_JOYSTICK_Z);

    
    _map = Node::create();
    _map->setContentSize(Size(MAP_WIDTH, MAP_HEIGHT));
    this->addChild(_map, LAYER_MAP_Z);
    
    auto cell = Cell::create(0, 1, 0, 0, 1, 1, 1, 1, 0, 0);
    //_map->setPosition(Vec2(500, 500));
    _map->addChild(cell);
    
    this->scheduleUpdate();
	return true;
}

void GameLayer::onOpen() {
    _transport->sendLogin();
    _transport->sendJoin("ewee");
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
            _playerX = (_right + _left) / 2;
            _playerY = (_bottom + _top) / 2;
            _playerScale = 1;
            log("Setborder left:%f, right:%f, bottom:%f, top:%f", _left, _right, _bottom, _top);
            _map->setContentSize(Size(_right-_left, _bottom-_top));
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
    _transport->open();
}

void GameLayer::onError() {
    _transport->open();
}

void GameLayer::update(float dt) {
    if (_playerCells.size() > 1) {
        double x = 0, y = 0;
        for (int i=0; i<_playerCells.size(); i++) {
            x += _playerCells.at(i)->_x;
            y += _playerCells.at(i)->_y;
        }
        _playerX = x / _playerCells.size();
        _playerY = y / _playerCells.size();
    }
//    _map->removeAllChildren();
//    log("Center x:%f, y:%f", _playerX, _playerY);
//    _map->setPosition(Vec2(_playerX, _playerY));
////    for (auto item : _nodes)
////    {
////        auto cell = item.second;
////        if (cell != NULL) {
////            _map->addChild(cell);
////        }
////    }
    
}

void GameLayer::updateNode(char* bytes) {
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
        offset+=8;
        Cell* cell = _nodes.at(killedId);
        if (cell != NULL) {
            _nodes.erase(killedId);
            cell->removeFromParentAndCleanup(true);
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
        for (uint16_t nick;;) {
            nick = *(uint16_t*)(bytes+offset);
            offset += 2;
            if (nick == 0) break;
        }
        Cell* cell = NULL;
        if (_nodes.at(nodeId) != NULL) {
            cell = _nodes.at(nodeId);
            cell->_size = size;
            cell->_x = x;
            cell->_y = y;
            cell->_r = r;
            cell->_g = g;
            cell->_b = b;
            cell->_isVirus = flagVirus;
            cell->_isEjected = flagEjected;
            cell->_isFood = flagAgitated;
            cell->setPosition(Vec2(x, y));
        }
        else {
            cell = Cell::create(nodeId, size, x, y, r, g, b, flagVirus, flagEjected, flagAgitated);
            _map->addChild(cell);
            _nodes.insert(nodeId, cell);
        }
        vector<uint32_t>::iterator iter = find(_nodesOnScreen.begin(), _nodesOnScreen.end(), nodeId);
        if (iter != _nodesOnScreen.end()) {
            Vector<Cell*>::iterator iter2 = find(_playerCells.begin(), _playerCells.end(), cell);
            if (iter2 == _playerCells.end()) {
                _playerCells.pushBack(cell);
                if (_playerCells.size() == 1) {
                    _playerX = cell->_x;
                    _playerY = cell->_y;
                }
            }
        }
    } while (true);
    
    // Removed Item
    uint16_t removedItemsLen = *(uint16_t*)(bytes+offset);
    ///log("Removed len:%d", removedItemsLen);
    std::vector<uint32_t> vecRemovedItemlist;
    offset += 4;
    for (int i = 0; i < removedItemsLen; i++) {
        uint32_t nodeId = *(uint32_t*)(bytes+offset);
        offset += 4;
        Cell* tmp = _nodes.at(nodeId);
        if (NULL != tmp) {
            _nodes.erase(nodeId);
            tmp->removeFromParentAndCleanup(true);
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

void GameLayer::onMenuSpit(Ref * pSender, CheckBox::EventType type) {
    _eventDispatcher->dispatchCustomEvent("Spit");
}

void GameLayer::onMenuDivide(Ref * pSender, CheckBox::EventType type) {
    _eventDispatcher->dispatchCustomEvent("Divide");
}
