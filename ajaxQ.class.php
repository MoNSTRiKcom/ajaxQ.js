<?php
# Взаимодействие бекенда с фронтендом.
trait ajaxQ
{
    public  $ajaxQ;

    # Массив для ajax ответа
    function setAjaxQ ($arr) { $this->ajaxQ = $arr; return; }

    # Редирект для ajax ответа
    function setRedirectAjaxQ ($url) { $this->ajaxQ['redirect'] = $url; return; }

    # Новый url для ajax ответа
    function setUrlAjaxQ ($url) { $this->ajaxQ['url'] = $url; return; }

    # Вставка контента до DOM
    function setBeforeAjaxQ ($dom, $content) { $this->ajaxQ['before'] = $dom; $this->ajaxQ['contentBefore'] = $content; return; }

    # Вставка контента после DOM
    function setAfterAjaxQ ($dom, $content) { $this->ajaxQ['after'] = $dom; $this->ajaxQ['contentAfter'] = $content; return; }

    # Вставка контента в DOM
    function setHtmlAjaxQ ($dom, $content) { $this->ajaxQ['html'] = $dom; $this->ajaxQ['contentHtml'] = $content; return; }

    # Улаление DOM
    function setRemoveAjaxQ ($dom) { $this->ajaxQ['remove'] = $dom; return; }

    # Вставка контента внутрь DOM - в конец
    function setAppendAjaxQ ($dom, $content) { $this->ajaxQ['append'] = $dom; $this->ajaxQ['contentAppend'] = $content; return; }

    # Новый url для ajax ответа
    function addContentAjaxQ ($html) { $this->ajaxQ['content'] = $html; return; }

    # Новый атрибут для ajax ответа
    function addAttrAjaxQ ($dom, $attr, $value, $name=NULL) { $this->ajaxQ['attr'][] = [ 'dom'=>$dom, 'attr'=>$attr, 'value'=>$value, 'name'=>$name ]; return; }

    # Новое сообщение для ajax ответа
    function addMessageAjaxQ ($text, $type='error') { $this->ajaxQ['message'][] = [ 'text'=>$text, 'type'=>$type ]; return; }

    # Новый сообщения tooltip для ajax ответа
    function addTooltipAjaxQ ($dom, $type) { $this->ajaxQ['tooltip'][] = [ 'dom'=>$dom, 'type'=>$type ]; return; }

    # Вывод сообщение ajax
    function getAjaxQ () { return json_encode($this->ajaxQ, JSON_UNESCAPED_UNICODE); }

    # Очистить данные ajax
    function cleanAjaxQ () { $this->ajaxQ = []; return; }

    # Вывод сообщений
    function getMessageAjaxQ ($type=NULL)
    {
        if (empty($this->ajaxQ['message'])) { return FALSE; }
        if (!empty($type))
        {
            $arr = [];
            foreach ($this->ajaxQ['message'] as $k => $v) { if ($v['type']==$type) { $arr[] = $v; } }
            return empty($arr) ? FALSE : $arr ;
        }

        return $this->ajaxQ['message'];
    }
}
?>