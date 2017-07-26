#include "StartupScene.h"
#include "../SceneManager.h"
#include "../../Common/CommonDefine.h"

Scene* StartupScene::createScene()
{
    // 'scene' is an autorelease object
    auto scene = Scene::create();
    
    // 'layer' is an autorelease object
    auto mainScene = StartupScene::create();

    // add layer as a child to scene
    scene->addChild(mainScene);

    // return the scene
    return scene;
}

// on "init" you need to initialize your instance
bool StartupScene::init()
{
    //////////////////////////////
    // 1. super init first
    if ( !Layer::init() )
    {
        return false;
    }

    Size size = Director::getInstance()->getVisibleSize();
    
    auto title = Sprite::create("startupScene/enter_background0.png");
    title->setPosition(Vec2(size.width / 2, size.height / 2));
    title->setOpacity(0);
    
    auto fadeIn = FadeIn::create(0.5);
    auto fadeOut = FadeOut::create(1.0);
    auto callFunc = CallFunc::create(CC_CALLBACK_0(StartupScene::loading, this));
    auto seq = Sequence::create(fadeIn, fadeOut, callFunc, NULL);
    
    title->runAction(seq);
    this->addChild(title);
    
    UserDefault::getInstance()->setBoolForKey("AutoLogin", false);
    if (!UserDefault::getInstance()->getBoolForKey("AutoLogin"))
    {
        UserDefault::getInstance()->setBoolForKey("Login", false);
        UserDefault::getInstance()->setStringForKey("AccountName", "");
        UserDefault::getInstance()->setStringForKey("AccountPassword", "");
    }
    return true;
}

void StartupScene::loading() {
    auto size = Director::getInstance()->getVisibleSize();
    auto background = Sprite::create("startupScene/enter_background1.png");
    background->setPosition(size.width/2,size.height/2);
    background->setScale(SCALE_FACTOR);
    this->addChild(background);
    
    auto loadingBackground = Sprite::create("startupScene/enter_loadingBar0.png");
    loadingBackground->setPosition(size.width/2, 60*SCALE_FACTOR);
    loadingBackground->setScale(SCALE_FACTOR);
    this->addChild(loadingBackground);
    
    _loadingLabel = Label::createWithTTF("loding:0%%","fonts/arial.ttf",20);
    _loadingLabel->setColor(Color3B(10, 10, 10));
    _loadingLabel->setPosition(size.width/2, 75*SCALE_FACTOR);
    _loadingLabel->setScale(SCALE_FACTOR);
    this->addChild(_loadingLabel);
    
    auto loadingSprite = Sprite::create("startupScene/enter_loadingBar1.png");
    _timer = ProgressTimer::create(loadingSprite);
    _timer->setPosition(size.width/2, 60*SCALE_FACTOR);
    _timer->setScale(SCALE_FACTOR);
    _timer->setType(ProgressTimerType::BAR);
    _timer->setMidpoint(Vec2(0,1));
    _timer->setBarChangeRate(Vec2(1,0));
    _timer->setPercentage(10);
    this->addChild(_timer);

    this->scheduleUpdate();
}

void StartupScene::update(float delta)
{
    float percent = _timer->getPercentage();
    percent+=0.5;
    _timer->setPercentage(percent);
    
    char str[50];
    sprintf(str, "loading:%d%%", int(percent));
    _loadingLabel->setString(str);
    
    if(percent>=100)
        this->scheduleOnce(schedule_selector(StartupScene::enterMainScene), 0);
}

void StartupScene::enterMainScene(float dt)
{
    SceneManager::getInstance()->changeScene(SceneManager::en_MainScene);
}
