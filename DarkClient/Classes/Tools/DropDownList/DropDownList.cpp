#include "DropDownList.h"

const float LABEL_INDENT = 5;

enum DropDownListZOrder
{
	LIST_BACKGROUND_Z,
	LIST_SPRITE_Z,
	LIST_LABEL_Z,
	LIST_MENU_Z,
	LIST_Z,
	MENU_Z,
	TOP_LABEL_Z
};

DropDownList::DropDownList()
: _callback(nullptr)
{

}

DropDownList::~DropDownList()
{

}

DropDownList * DropDownList::create(const std::string & normalImage, const std::string & selectedImage,
	const std::string & scale9Image, ValueVector & stringList)
{
	DropDownList * list = new DropDownList();
	if (list && list->init(normalImage, selectedImage, scale9Image, stringList))
	{
		list->autorelease();
		return list;
	}

	CC_SAFE_DELETE(list);
	return nullptr;
}

bool DropDownList::init(const std::string & normalImage, const std::string & selectedImage,
	const std::string & scale9Image, ValueVector & stringList)
{
	if (!Node::init())
	{
		return false;
	}

	/*创建顶部显示菜单*/
	auto topItem = MenuItemImage::create(
		normalImage,
		normalImage,
		CC_CALLBACK_1(DropDownList::menuTopItemCallback, this));
	topItem->setPosition(Vec2::ZERO);

	auto menu = Menu::create(topItem, NULL);
	menu->setPosition(Vec2::ZERO);
	this->addChild(menu, MENU_Z);

	Size size = topItem->getContentSize();

	_topLabel = Label::createWithTTF(stringList.at(0).asString(), "fonts/STSONG.TTF", 22);
	_topLabel->setAnchorPoint(Vec2(0, 0.5));
	_topLabel->setPosition(-size.width / 2 + LABEL_INDENT, 0);
	this->addChild(_topLabel, TOP_LABEL_Z);

	_list = Node::create();
	_list->setVisible(false);
	this->addChild(_list, LIST_Z);

	auto listMenu = Menu::create();
	listMenu->setPosition(Vec2::ZERO);
	_list->addChild(listMenu, LIST_MENU_Z);

	auto background = Scale9Sprite::create(scale9Image);
	Size itemSize = background->getContentSize();

	int count = 0;

	/*创建菜单列表项*/
	for (auto v : stringList)
	{
		count++;
		Vec2 position = Vec2(0, -(size.height/2+itemSize.height/2+(count-1)*itemSize.height));

		//标签
		std::string text = v.asString();
		auto label = Label::createWithTTF(text, "fonts/STSONG.TTF", 22);
		label->setAnchorPoint(Vec2(0, 0.5));
		label->setPosition(-itemSize.width / 2 + LABEL_INDENT, position.y);
		_list->addChild(label, LIST_LABEL_Z);
		_labelList.pushBack(label);

		//菜单
		auto item = MenuItem::create(CC_CALLBACK_1(DropDownList::menuListItemCallback, this));
		item->setPosition(position);
		item->setName(StringUtils::format("%d", count));
		item->setContentSize(itemSize);
		listMenu->addChild(item);

		//列表项选中图片
		auto sprite = Sprite::create(selectedImage);
		sprite->setPosition(position);
		sprite->setVisible(false);
		_list->addChild(sprite, LIST_SPRITE_Z);
		_spriteList.pushBack(sprite);
	}

	//列表背景图
	background->setContentSize(Size(itemSize.width, itemSize.height*count));
	background->setPosition(Vec2(0, -(size.height/2+(itemSize.height*count)/2)));
	_list->addChild(background, LIST_BACKGROUND_Z);

	_currentIndex = 1;
	_spriteList.at(_currentIndex - 1)->setVisible(true);

	return true;
}

void DropDownList::menuTopItemCallback(Ref * pSender)
{
	_list->setVisible(!_list->isVisible());
}

void DropDownList::menuListItemCallback(Ref * pSender)
{
	auto item = dynamic_cast<MenuItem *>(pSender);
	int index = Value(item->getName()).asInt();

	_spriteList.at(_currentIndex - 1)->setVisible(false);
	_currentIndex = index;
	_spriteList.at(_currentIndex - 1)->setVisible(true);
	_topLabel->setString(_labelList.at(_currentIndex - 1)->getString());
	_list->setVisible(false);

	if (_callback)
	{
		_callback(_currentIndex);
	}
	
}

void DropDownList::setCallback(const ccCustomCallback & callback)
{
	_callback = callback;
}