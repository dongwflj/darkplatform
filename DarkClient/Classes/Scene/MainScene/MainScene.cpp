#include "MainScene.h"
#include "ChatLayer.h"
#include "MenuLayer.h"
#include "../../Common/CommonDefine.h"
#include "../../Tools/PromptBox/PromptBox.h"
#include "../../Transport/Transport.h"

enum MenuZOrder
{
    MENU_SCENE_BACKGROUND_Z,
    MENU_SCENE_LAYER_Z,
    MENU_SCENE_MENU_Z,
    MENU_SCENE_PROMPT_Z
};

Scene* MainScene::createScene() {
    auto scene = Scene::create();
    auto mainScene = MainScene::create();
    scene->addChild(mainScene);
    return scene;
}

//static void event_cb(pc_client_t* client, int ev_type, void* ex_data, const char* arg1, const char* arg2)
//{
//    log("test: get event %s, arg1: %s, arg2: %s\n", pc_client_ev_str(ev_type),
//        arg1 ? arg1 : "", arg2 ? arg2 : "");
//}
//
//static void request_cb(const pc_request_t* req, int rc, const char* resp)
//{
//    log("test: get response：%s", resp);
//}
//
//static void notify_cb(const pc_notify_t* noti, int rc)
//{
//}

// on "init" you need to initialize your instance
bool MainScene::init() {
    if ( !Layer::init() )
    {
        return false;
    }

    _gameItem = MenuItemImage::create(
                                      "mainScene/menu_game_btn2.png",
                                      "mainScene/menu_game_btn3.png",
                                      CC_CALLBACK_1(MainScene::menuGameCallback, this));
    _gameItem->setAnchorPoint(Vec2(0, 0));
    _gameItem->setPosition(Vec2(0, 0));
    _gameItem->setScale(SCALE_FACTOR);
    _gameFlag = true;

    auto size = Director::getInstance()->getVisibleSize();
    _chatItem = MenuItemImage::create(
                                      "mainScene/menu_chat_btn0.png",
                                      "mainScene/menu_chat_btn1.png",
                                      CC_CALLBACK_1(MainScene::menuChatCallback, this));
    _chatItem->setAnchorPoint(Vec2(0, 0));
    _chatItem->setPosition(Vec2(0, size.height/2));
    _chatItem->setScale(SCALE_FACTOR);
    _chatFlag = false;
    
    auto menu = Menu::create(_gameItem, _chatItem, NULL);
    menu->setPosition(Vec2::ZERO);
    this->addChild(menu, MENU_SCENE_MENU_Z);
    

    auto background = Sprite::create("mainScene/background.png");
    background->setPosition(size.width/2,size.height/2);
    background->setScale(SCALE_FACTOR);
    this->addChild(background, MENU_SCENE_BACKGROUND_Z);
    
    _menuLayer = MenuLayer::create();
    this->addChild(_menuLayer, MENU_SCENE_LAYER_Z);
    
    _eventDispatcher->addCustomEventListener("GameStart", CC_CALLBACK_1(MainScene::gameStartEvent, this));
    _gameStart = false;
    auto transport = Transport::getInstance();
    transport->open();
    transport->setObserver(this);
    return true;
    
//#define EV_HANDLER_EX ((void*)0x44)
//#define REQ_ROUTE "gate.gateHandler.queryEntry"
////#define REQ_ROUTE "connector.entryHandler.entry"
//#define REQ_MSG "{\"uid\": \"test\"}"
//#define REQ_EX ((void*)0x22)
//#define REQ_TIMEOUT 10
//    
//#define NOTI_ROUTE "test.testHandler.notify"
//#define NOTI_MSG "{\"content\": \"test content\"}"
//#define NOTI_EX ((void*)0x33)
//#define NOTI_TIMEOUT 30
//    
//    pc_lib_init(NULL, NULL, NULL, NULL);
//    
//    pc_client_config_t config = {
//        30, /* conn_timeout */
//        0, /* enable_reconn */
//        PC_ALWAYS_RETRY, /* reconn_max_retry */
//        2, /* reconn_delay */
//        30, /* reconn_delay_max */
//        1, /* reconn_exp_backoff */
//        0, /* enable_polling */
//        NULL, /* local_storage_cb */
//        NULL, /* ls_ex_data */
//        PC_TR_NAME_UV_TCP /* transport_name */
//    };
//    
//    _client = (pc_client_t*)malloc(pc_client_size());
//    pc_client_init(_client, (void*)0x0, &config);
//    int handler_id;
//    handler_id = pc_client_add_ev_handler(_client, event_cb, EV_HANDLER_EX, NULL);
//    
//    int ret = pc_client_connect(_client, "111.13.138.138", 10680, NULL);
//    log("connect ret:%d", ret);
//    SLEEP(1);
//    pc_request_with_timeout(_client, REQ_ROUTE, REQ_MSG, REQ_EX, REQ_TIMEOUT, request_cb);
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
    
///Temp comment for pomelo
//    auto gameLayer = GameLayer::create();
//    this->addChild(gameLayer, GAME_Z);
    return true;
}

void MainScene::menuGameCallback(Ref * pSender)
{
    if (_gameStart)
    {
        return;
    }
    
    log("press");
    
    if (!_gameFlag)
    {
        _menuLayer = MenuLayer::create();
        this->addChild(_menuLayer, MENU_SCENE_LAYER_Z);
        
        _chatLayer->removeFromParentAndCleanup(true);
        _chatLayer = NULL;
        
        _gameFlag = true;
        _gameItem->setNormalImage(Sprite::create("mainScene/menu_game_btn2.png"));
        _gameItem->setSelectedImage(Sprite::create("mainScene/menu_game_btn3.png"));
        _chatFlag = false;
        _chatItem->setNormalImage(Sprite::create("mainScene/menu_chat_btn0.png"));
        _chatItem->setSelectedImage(Sprite::create("mainScene/menu_chat_btn1.png"));
    }
}

void MainScene::menuChatCallback(Ref * pSender)
{
    if (_gameStart)
    {
        return;
    }
    
    if (!_chatFlag)
    {
        _chatLayer = ChatLayer::create();
        this->addChild(_chatLayer, MENU_SCENE_LAYER_Z);
        
        _menuLayer->removeFromParentAndCleanup(true);
        _menuLayer = NULL;
        
        _chatFlag = true;
        _chatItem->setNormalImage(Sprite::create("mainScene/menu_chat_btn2.png"));
        _chatItem->setSelectedImage(Sprite::create("mainScene/menu_chat_btn3.png"));
        _gameFlag = false;
        _gameItem->setNormalImage(Sprite::create("mainScene/menu_game_btn0.png"));
        _gameItem->setSelectedImage(Sprite::create("mainScene/menu_game_btn1.png"));
    }
    
}

void MainScene::gameStartEvent(EventCustom * event)
{
    _gameStart = true;
}

void MainScene::onExit()
{
    Layer::onExit();
    _eventDispatcher->removeCustomEventListeners("GameStart");
    
}

void MainScene::onOpen() {
        log("Connection opened");
}

void MainScene::onMessage(char* bytes) {
    
}

void MainScene::onClose() {
    auto prompt = PromptBox::getInstance()->createPrompt("Connection closed");
    if (prompt)
    {
        this->addChild(prompt, MENU_SCENE_PROMPT_Z);
    }
    auto transport = Transport::getInstance();
    transport->open();
}

void MainScene::onError() {
    auto prompt = PromptBox::getInstance()->createPrompt("Connection error");
    if (prompt)
    {
        this->addChild(prompt, MENU_SCENE_PROMPT_Z);
    }
    auto transport = Transport::getInstance();
    transport->open();
}
