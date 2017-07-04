#ifndef _GameLayer_H_
#define _GameLayer_H_

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
class GameLayer : public Layer, public TransportObserver {
public:
	GameLayer();
	~GameLayer();

	virtual bool init();

    virtual void onOpen();
    virtual void onMessage(char* bytes);
    virtual void onClose();
    virtual void onError();
    
	CREATE_FUNC(GameLayer);
	
    virtual void update(float dt);
    void onMenuSpit(Ref * pSender, CheckBox::EventType type);
    void onMenuDivide(Ref * pSender, CheckBox::EventType type);
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
};

#endif
