#ifndef __PromptBox_H__
#define __PromptBox_H__

#include "cocos2d.h"
#include "ui/CocosGUI.h"

USING_NS_CC;
using namespace ui;

/*给玩家的系统提示框*/

class PromptBox : public Ref{
public:
	PromptBox();
	~PromptBox();

	static PromptBox * getInstance();

	virtual bool init();

	Node * createPrompt(const std::string & msg);		//创建提示框，参数：提示文字
	void removePrompt(Ref * pSender);
	void clearList();
private:
	static PromptBox * s_PromptBox;
	Vector<Node *> _promptList;
};

#endif