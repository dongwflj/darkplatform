#ifndef __MAIN_SCENE_H__
#define __MAIN_SCENE_H__

#include "cocos2d.h"
#include "ui/CocosGUI.h"
#include <libpomelo2/include/pomelo.h>
#include <libpomelo2/include/pomelo_trans.h>
#include "../../Transport/TransportObserver.h"

USING_NS_CC;
using namespace ui;

class MainScene : public cocos2d::Layer, public TransportObserver
{
public:
    static Scene* createScene();
    virtual bool init();
    CREATE_FUNC(MainScene);

    virtual void onExit();
    void menuGameCallback(Ref * pSender);
    void menuChatCallback(Ref * pSender);
    void gameStartEvent(EventCustom * event);

    virtual void onOpen();
    virtual void onMessage(char* bytes);
    virtual void onClose();
    virtual void onError();
private:
    MenuItemImage * _gameItem;
    MenuItemImage * _chatItem;
    Layer * _menuLayer;
    Layer * _chatLayer;
    bool _gameFlag;
    bool _chatFlag;
    bool _gameStart;
};

#endif // __MAIN_SCENE_H__
