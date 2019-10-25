<?php
/**
 * CancelButton.php
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the MIT License, which
 * is bundled with this package in the file LICENSE.txt.
 *
 * It is also available on the Internet at the following URL:
 * https://docs.auroraextensions.com/magento/extensions/2.x/simplereturns/LICENSE.txt
 *
 * @package       AuroraExtensions_SimpleReturns
 * @copyright     Copyright (C) 2019 Aurora Extensions <support@auroraextensions.com>
 * @license       MIT License
 */
declare(strict_types=1);

namespace AuroraExtensions\SimpleReturns\Ui\Component\Control;

use AuroraExtensions\SimpleReturns\{
    Model\Security\Token as Tokenizer,
    Shared\ModuleComponentInterface
};
use Magento\Framework\{
    App\RequestInterface,
    Escaper,
    UrlInterface,
    View\Element\UiComponent\Control\ButtonProviderInterface
};

class CancelButton implements ButtonProviderInterface, ModuleComponentInterface
{
    /** @property RequestInterface $request */
    protected $request;

    /** @property UrlInterface $urlBuilder */
    protected $urlBuilder;

    /**
     * @param RequestInterface $request
     * @param UrlInterface $urlBuilder
     * @return void
     */
    public function __construct(
        RequestInterface $request,
        UrlInterface $urlBuilder
    ) {
        $this->request = $request;
        $this->urlBuilder = $urlBuilder;
    }

    /**
     * @return array
     */
    public function getButtonData()
    {
        return [
            'class' => 'cancel secondary',
            'label' => __('Cancel'),
            'on_click' => $this->getOnClickJs() ?? '',
            'sort_order' => 30,
        ];
    }

    /**
     * @return string|null
     */
    protected function getOnClickJs(): ?string
    {
        /** @var int|string|null $rmaId */
        $rmaId = $this->request->getParam(self::PARAM_RMA_ID);
        $rmaId = $rmaId !== null && is_numeric($rmaId)
            ? (int) $rmaId
            : null;

        if ($rmaId !== null) {
            /** @var string|null $token */
            $token = $this->request->getParam(self::PARAM_TOKEN);
            $token = $token !== null && Tokenizer::isHex($token) ? $token : null;

            if ($token !== null) {
                /** @var string $targetUrl */
                $targetUrl = $this->urlBuilder->getUrl(
                    'simplereturns/rma/view',
                    [
                        'rma_id' => $rmaId,
                        'token' => $token,
                    ]
                );

                return "(function(){window.location='{$targetUrl}';})();";
            }
        }

        return null;
    }
}
