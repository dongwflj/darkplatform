#include "MaskLayer.h"

MaskLayer::MaskLayer()
{

}

MaskLayer::~MaskLayer()
{

}

bool MaskLayer::init()
{
	if (!Layer::init())
	{
		return false;
	}

	auto mask = LayerColor::create(Color4B(0, 0, 0, 76), 800, 450);
	this->addChild(mask);

	auto listener = EventListenerTouchOneByOne::create();
	listener->setSwallowTouches(true);

	listener->onTouchBegan = CC_CALLBACK_2(MaskLayer::onTouchBegan, this);
	listener->onTouchMoved = CC_CALLBACK_2(MaskLayer::onTouchMoved, this);
	listener->onTouchEnded = CC_CALLBACK_2(MaskLayer::onTouchEnded, this);

	_eventDispatcher->addEventListenerWithSceneGraphPriority(listener, this);

	return true;
}

bool MaskLayer::onTouchBegan(Touch * touch, Event * event)
{
	return true;
}

void MaskLayer::onTouchMoved(Touch * touch, Event * event)
{

}

void MaskLayer::onTouchEnded(Touch * touch, Event * event)
{

}
