#ifndef _MenuLayer_H_
#define _MenuLayer_H_

#include "cocos2d.h"
#include "ui/CocosGUI.h"

USING_NS_CC;
using namespace ui;

class MenuLayer : public Layer{
public:
	MenuLayer();
	~MenuLayer();

	virtual bool init();

	CREATE_FUNC(MenuLayer);
    
//    virtual void onExit();
    
    
    void gameStartEvent(EventCustom * event);
    void menuStartCallback(Ref * pSender);
    
private:
    MenuItemImage * _extendItem1;
    MenuItemImage * _extendItem2;
    Vector<Menu *> _menuList;
    TextField * _gameName;
};

#endif
