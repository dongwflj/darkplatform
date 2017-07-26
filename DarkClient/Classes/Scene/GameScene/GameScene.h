#ifndef _GameScene_H_
#define _GameScene_H_

#include "cocos2d.h"
#include "ui/CocosGUI.h"

#include "../../Transport/TransportObserver.h"
#include "Cell.h"

USING_NS_CC;
using namespace ui;
using namespace std;

//class Joystick;
//class Player;
//class Bean;
//class Spore;
//class Prick;

class Transport;
class GameScene : public Layer, public TransportObserver {
public:
    
    static Scene* createScene();
    virtual bool init();

    void destroy(Cell* cell);
    void SpitUpdate(float dt);
    
    virtual void onOpen();
    virtual void onMessage(char* bytes);
    virtual void onClose();
    virtual void onError();
    
	CREATE_FUNC(GameScene);
	
    virtual void update(float dt);
    void onMenuSpit(Ref * pSender, Widget::TouchEventType type);
    void onMenuDivide(Ref * pSender, CheckBox::EventType type);
    
    bool onTouchBegan(Touch * touch, Event * event);
    void onTouchMoved(Touch * touch, Event * event);
    void onTouchEnded(Touch * touch, Event * event);
    void onTouchCancelled(Touch * touch, Event * event);
    
private:
    string getString(char* buffer);
    void updateNode(char* bytes);
    
    Transport* _transport;
    double _left;
    double _top;
    double _right;
    double _bottom;
    double _playerX;
    double _playerY;
    double _playerScale;
    
    double _nodeX;
    double _nodeY;
    double _viewZoom;
    
    Vector<Cell*> _playerCells;
    vector<uint32_t> _nodesOnScreen;
    Map<uint32_t, Cell*> _nodes;
    
    Node* _map;
    Size _visibleSize;
    float _halfVisibleWidth;
    float _halfVisibleHeight;
    
    Vec2 _leftTouchStartPos;
    Vec2 _leftVector;
    
    double _viewCenterX;
    double _viewCenterY;
    
    Label * _networkStatusLabel;
    DrawNode* _drawNode;
    float _viewScale;
};

#endif
