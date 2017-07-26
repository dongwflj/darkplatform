#ifndef __STARTUP_SCENE_H__
#define __STARTUP_SCENE_H__

#include "cocos2d.h"
#include "ui/CocosGUI.h"
#include <libpomelo2/include/pomelo.h>
#include <libpomelo2/include/pomelo_trans.h>

USING_NS_CC;
using namespace ui;

class StartupScene : public cocos2d::Layer
{
public:
    static cocos2d::Scene* createScene();

    virtual bool init();
    
    // implement the "static create()" method manually
    CREATE_FUNC(StartupScene);

    virtual void update(float delta);
    
private:
    void loading();
    void enterMainScene(float dt);
    pc_client_t* _client;
    ProgressTimer * _timer;
    Label * _loadingLabel;
};

#endif // __STARTUP_SCENE_H__
