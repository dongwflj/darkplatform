//
//  SceneManager.h
//  DarkClient
//
//  Created by Ewen Dong on 2017/7/14.
//
//

#ifndef SceneManager_hpp
#define SceneManager_hpp

#include "cocos2d.h"
USING_NS_CC;

class SceneManager : public Ref
{
public:
    enum SceneType
    {
        en_StartupScene,
        en_MainScene,
        en_GameScene
    };
    
    static SceneManager* getInstance();
    virtual bool init();
    
    void changeScene(SceneType enSceneType);
private:
    static SceneManager * s_SceneManager;
    
};

#endif /* SceneManager_hpp */
