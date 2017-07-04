#include "MainScene.h"
#include "GameLayer.h"

enum ZOrder
{
    BACKGROUND_Z,
    DATA_Z,
    GAME_Z,
    MENU_Z,
    SETTING_Z
};

Scene* MainLayer::createScene()
{
    // 'scene' is an autorelease object
    auto scene = Scene::create();
    
    // 'layer' is an autorelease object
    auto layer = MainLayer::create();

    // add layer as a child to scene
    scene->addChild(layer);

    // return the scene
    return scene;
}

// on "init" you need to initialize your instance
bool MainLayer::init()
{
    //////////////////////////////
    // 1. super init first
    if ( !Layer::init() )
    {
        return false;
    }
    
    
    /// Design size fit to actual screen rate: 800*450
//    auto visibleSize = Director::getInstance()->getVisibleSize();
//    ///auto winSize = Director::getInstance()->getWinSize();
//    Vec2 origin = Director::getInstance()->getVisibleOrigin();
//
//
//    auto right = visibleSize.width - 10 - 60;
//    auto spitItem = CheckBox::create(
//                                      "mainScene/spit_btn.png",
//                                      "mainScene/spit_btn.png");
//    spitItem->setPosition(Vec2(right, origin.y + 50));
//    spitItem->setZoomScale(-0.1f);
//    spitItem->addEventListener(CC_CALLBACK_2(MainLayer::onMenuSpit, this));
//    this->addChild(spitItem, MENU_Z);
//    
//    right -= 70;
//    auto divideItem = CheckBox::create(
//                                       "mainScene/divide_btn.png",
//                                       "mainScene/divide_btn.png");
//    divideItem->setPosition(Vec2(right, origin.y + 50));
//    divideItem->setZoomScale(-0.1f);
//    divideItem->addEventListener(CC_CALLBACK_2(MainLayer::onMenuDivide, this));
//    this->addChild(divideItem, MENU_Z);
    

    /////////////////////////////
    // 2. add a menu item with "X" image, which is clicked to quit the program
    //    you may modify it.

//    // add a "close" icon to exit the progress. it's an autorelease object
//    auto closeItem = MenuItemImage::create(
//                                           "CloseNormal.png",
//                                           "CloseSelected.png",
//                                           CC_CALLBACK_1(MainLayer::menuCloseCallback, this));
//    
//    closeItem->setPosition(Vec2(origin.x + visibleSize.width - closeItem->getContentSize().width/2 ,
//                                origin.y + closeItem->getContentSize().height/2));

    // create menu, it's an autorelease object
//    auto menu = Menu::create(closeItem, NULL);
//    menu->setPosition(Vec2::ZERO);
//    this->addChild(menu, 1);

    /////////////////////////////
    // 3. add your codes below...

    // add a label shows "Hello World"
    // create and initialize a label
//    
//    auto label = Label::createWithTTF("Hello World", "fonts/Marker Felt.ttf", 24);
//    
//    // position the label on the center of the screen
//    label->setPosition(Vec2(origin.x + visibleSize.width/2,
//                            origin.y + visibleSize.height - label->getContentSize().height));
//
//    // add the label as a child to this layer
//    this->addChild(label, LAYER_Z);
    auto gameLayer = GameLayer::create();
    this->addChild(gameLayer, GAME_Z);
    return true;
}
