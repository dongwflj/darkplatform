#include "MyMenu.h"

Menu * MyMenu::create(MenuItem* item, ...)
{
	va_list args;
	va_start(args, item);

	Menu *ret = MyMenu::createWithItems(item, args);

	va_end(args);

	return ret;
}

Menu* MyMenu::createWithArray(const Vector<MenuItem*>& arrayOfItems)
{
	auto ret = new (std::nothrow) MyMenu();
	if (ret && ret->initWithArray(arrayOfItems))
	{
		ret->autorelease();
	}
	else
	{
		CC_SAFE_DELETE(ret);
	}

	return ret;
}

Menu* MyMenu::createWithItems(MenuItem* item, va_list args)
{
	Vector<MenuItem*> items;
	if (item)
	{
		items.pushBack(item);
		MenuItem *i = va_arg(args, MenuItem*);
		while (i)
		{
			items.pushBack(i);
			i = va_arg(args, MenuItem*);
		}
	}

	return MyMenu::createWithArray(items);
}

bool MyMenu::initWithArray(const Vector<MenuItem*>& arrayOfItems)
{
	if (Layer::init())
	{
		_enabled = true;
		// menu in the center of the screen
		Size s = Director::getInstance()->getWinSize();

		this->ignoreAnchorPointForPosition(true);
		setAnchorPoint(Vec2(0.5f, 0.5f));
		this->setContentSize(s);

		setPosition(s.width / 2, s.height / 2);

		int z = 0;

		for (auto& item : arrayOfItems)
		{
			this->addChild(item, z);
			z++;
		}

		_selectedItem = nullptr;
		_state = Menu::State::WAITING;

		// enable cascade color and opacity on menus
		setCascadeColorEnabled(true);
		setCascadeOpacityEnabled(true);


		auto touchListener = EventListenerTouchOneByOne::create();
		touchListener->setSwallowTouches(false);

		touchListener->onTouchBegan = CC_CALLBACK_2(Menu::onTouchBegan, this);
		touchListener->onTouchMoved = CC_CALLBACK_2(Menu::onTouchMoved, this);
		touchListener->onTouchEnded = CC_CALLBACK_2(Menu::onTouchEnded, this);
		touchListener->onTouchCancelled = CC_CALLBACK_2(Menu::onTouchCancelled, this);

		_eventDispatcher->addEventListenerWithSceneGraphPriority(touchListener, this);

		return true;
	}
	return false;
}