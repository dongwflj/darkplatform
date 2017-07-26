#include "ChatLayer.h"

enum ChatZOrder
{
	CHAT_BACKGROUND_Z,
	CHAT_SCROLLVIEW_Z,
	CHAT_MENU_Z,
	CHAT_SPRITE_Z,
	CHAT_TEXTFIELD_Z,
	CHAT_LABEL_Z,
	CHAT_SCROLL_LAYER_Z,
	CHAT_PROMPT_Z,
	CHAT_MESSAGE_SPRITE_Z,
	CHAT_MESSAGE_LABEL_Z
};

ChatLayer::ChatLayer()
{
}

ChatLayer::~ChatLayer()
{
	_eventDispatcher->removeCustomEventListeners("ChatMsgReceive");
}

bool ChatLayer::init()
{
	if (!Layer::init())
	{
		return false;
	}
	return true;
}
