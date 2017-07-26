#include "PromptBox.h"

const std::string PROMPT_SCALE9 = "mainScene/prompt_scale9.png";
const float LABEL_LEFT_INDENT = 10;
const float LABEL_BOTTOM_INDENT = 5;
const int PROMPT_MAX_NUM = 4;

enum PromptZOrder
{
	PROMPT_BACKGROUND_Z,
	PROMPT_LABEL_Z
}; 

PromptBox * PromptBox::s_PromptBox = NULL;

PromptBox::PromptBox()
{

}

PromptBox::~PromptBox()
{
	/*for (auto item : _promptList)
	{
	item->stopAllActions();
	}*/
}

PromptBox * PromptBox::getInstance()
{
	if (s_PromptBox == NULL)
	{
		s_PromptBox = new PromptBox();
		if (s_PromptBox && s_PromptBox->init())
		{
			s_PromptBox->autorelease();
		}
		else
		{
			CC_SAFE_DELETE(s_PromptBox);
		}
	}
	return s_PromptBox;
}

bool PromptBox::init()
{
	return true;
}

Node * PromptBox::createPrompt(const std::string & msg)
{
	if (_promptList.size() >= PROMPT_MAX_NUM)
	{
		return NULL;
	}
	auto prompt = Node::create();

	auto background = Scale9Sprite::create(PROMPT_SCALE9);
	auto label = Label::createWithTTF(msg, "fonts/STSONG.TTF", 18);
	Size size = label->getContentSize();

	Size promptSize = Size(size.width + LABEL_LEFT_INDENT * 2, size.height + LABEL_BOTTOM_INDENT * 2);
	//label->setPosition(Vec2(promptSize.width / 2, promptSize.height / 2));
	label->setColor(Color3B(170, 178, 161));
	prompt->addChild(label,PROMPT_LABEL_Z);

	background->setContentSize(promptSize);
	prompt->addChild(background,PROMPT_BACKGROUND_Z);

	prompt->runAction(Sequence::create(
		DelayTime::create(0.5f),
		FadeOut::create(1.0f),
		CallFuncN::create(CC_CALLBACK_0(PromptBox::removePrompt, this, prompt)),
		NULL));

	_promptList.pushBack(prompt);
    auto visableSize = Director::getInstance()->getVisibleSize();
	int count = (int)_promptList.size();
	for (int i = 0; i < count; i++)
	{
		auto item = _promptList.at(i);
		item->setPosition(Vec2(visableSize.width/2, visableSize.height/2 + (count - i - 1) * 40));
        item->setScale(2.4);
	}
	return prompt;
}

void PromptBox::removePrompt(Ref * pSender)
{
	auto prompt = dynamic_cast<Node *>(pSender);
	_promptList.eraseObject(prompt);
	prompt->removeFromParentAndCleanup(true);
}

void PromptBox::clearList()
{
	for (auto item : _promptList)
	{
		item->removeFromParentAndCleanup(true);
	}
	_promptList.clear();
}
