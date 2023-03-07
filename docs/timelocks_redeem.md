# Como destrancar os tokens do timelock dado seu tempo:


Vou pegar como exemplo, esses timelocks:

```
[
    //Service Provider: H.FC.A
    "0xC9B1D9335BE15625Ddf91EBb848cEeEDc546B02E",

    //Service Provider: H.F.L.H
    "0xEdd4a98aC93fcfcCd5226a3daA2DcBb37b94c4AA",

    // Service Provider: H.F.J.D.B
    "0x1226a31008C316FfE800Dd210a19083A4B0Ed9C7",

    // Service Provider: H.F.A.N
    "0x812E90077b6011b907EDF6Db1383EF33cA8EA257",
]
```


Desde que os timelocks estejam seguindo o mesmo padrão de código desse repositório,
o tutorial aqui deve funcionar para cada um desses contratos. Em seguida, estão os passos
para fazer o unlock:


## 1. Entrar na aba "Write Contract" do contrato e ativar a conectar a carteira

Vamos usar como exemplo esse contrato:

https://polygonscan.com/address/0xC9B1D9335BE15625Ddf91EBb848cEeEDc546B02E#writeContract

Basicamente, você pode apenas mudar o endereço no link para o endereço do seu timelock.

Já deve aparecer uma página assim:

![imag1](./images/img1.png)

Você deve então conectar a carteira para que possa chamar a função de release.

## 2. Executar a função de release

Com a carteira conectada, já deve ser possível executar a função de release. Dito isso, se você estiver na hora certa de release, a transação deve
funcionar normalmente.

![imag2](./images/img2.png)

Ao clicar em Write, vai abrir uma aba da metamask para confirmar uma transação. Você vai precisar de um pouco de matic para fazer o release. 


Completada essa transação, os tokens vão para o endereço "beneficiário". Certifique-se que o endereço de beneficiário do seu contrato é o seu mesmo. Se não for, não tem problema executar a função. Os tokens sempre vão para o endereço do beneficiário, então você pode executar o contrato à partir de outra carteira sem problema.

Para ver o beneficiário (se estiver na dúvida), veja a aba ao lado, escrito "Read Contract":

![imag3](./images/img3.png)






