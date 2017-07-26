//
//  SceneManager.cpp
//  DarkClient
//
//  Created by Ewen Dong on 2017/7/14.
//
//
#include "MainScene/MainScene.h"
#include "StartupScene/StartupScene.h"
#include "GameScene/GameScene.h"
#include "SceneManager.h"

SceneManager * SceneManager::s_SceneManager = NULL;

SceneManager* SceneManager::getInstance()
{
    if (s_SceneManager == NULL)
    {
        s_SceneManager = new SceneManager();
        if (s_SceneManager && s_SceneManager->init())
        {
            s_SceneManager->autorelease();
        }
        else
        {
            CC_SAFE_DELETE(s_SceneManager);
            s_SceneManager = NULL;
        }
    }
    return s_SceneManager;
}

bool SceneManager::init()
{
    return true;
}

void SceneManager::changeScene(SceneType enSceneType)
{
    Scene * scene = NULL;
    //	TransitionScene * ccts = NULL;
    
    switch (enSceneType)
    {
        case en_StartupScene:
            scene = StartupScene::createScene();
            break;
        case en_MainScene:
            scene = MainScene::createScene();
            break;
        case en_GameScene:
            scene = GameScene::createScene();
            break;
        default:
            break;
    }
    
    if (scene == NULL)
        return;
    
    auto pDirector = Director::getInstance();
    auto curScene = pDirector->getRunningScene();
    
    //	if (ccts == NULL)
    //		ccts = CCTransitionFadeTR::create(1.0f, scene);
    
    if (curScene == NULL) {
        pDirector->runWithScene(scene);
    }
    else {
        pDirector->replaceScene(scene);
    }
}
