import React, { useEffect, useRef, useState } from 'react';

// Define the structure for transaction info
interface GooglePayButtonProps {
  totalPrice: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: any) => void;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({ totalPrice, onPaymentSuccess, onPaymentError }) => {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeGooglePay = () => {
      if (!window.google || !window.google.payments || !window.google.payments.api) {
        console.warn("Google Pay API not loaded yet.");
        return;
      }
    
      const paymentsClient = new window.google.payments.api.PaymentsClient({ environment: 'TEST' });
      
      const baseRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
      };

      const allowedPaymentMethods = [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId',
          },
        },
      }];

      const isReadyToPayRequest = { ...baseRequest, allowedPaymentMethods };
      
      paymentsClient.isReadyToPay(isReadyToPayRequest)
        .then(response => {
          if (response.result && buttonContainerRef.current) {
            const button = paymentsClient.createButton({
              onClick: () => {
                const transactionInfo = {
                  totalPriceStatus: 'FINAL',
                  totalPrice: totalPrice,
                  currencyCode: 'USD',
                  countryCode: 'US',
                };
                
                const merchantInfo = {
                  merchantId: 'BCR2DN7T5DR3JGA7', // Using Google's test merchant ID
                  merchantName: 'Rocio Ramirez Store
',
                };

                const paymentDataRequest = {
                  ...baseRequest,
                  allowedPaymentMethods,
                  transactionInfo,
                  merchantInfo,
                };

                paymentsClient.loadPaymentData(paymentDataRequest)
                  .then(paymentData => {
                    console.log('Payment successful', paymentData);
                    onPaymentSuccess();
                  })
                  .catch(err => {
                    console.error('Payment failed', err);
                    onPaymentError(err);
                  });
              },
              buttonColor: 'black',
              buttonType: 'subscribe',
              buttonSizeMode: 'fill',
            });
            
            // Clear any existing button before appending
            buttonContainerRef.current.innerHTML = '';
            buttonContainerRef.current.appendChild(button);
            setIsReady(true);
          }
        })
        .catch(err => {
          console.error('isReadyToPay failed: ', err);
          onPaymentError(err);
        });
    };

    // Check if the script is already loaded
    if (window.google && window.google.payments && window.google.payments.api) {
        initializeGooglePay();
    } else {
        // Wait for the script to load
        const script = document.getElementById('google-gsi-script');
        if (script) {
            script.addEventListener('load', initializeGooglePay);
            return () => script.removeEventListener('load', initializeGooglePay);
        }
    }
  }, [totalPrice, onPaymentSuccess, onPaymentError]);


  return (
    <div className="mt-8">
      {!isReady && (
        <div className="w-full h-[44px] flex items-center justify-center bg-gray-800 text-gray-400 font-semibold rounded-full animate-pulse">
            Loading Payment...
        </div>
      )}
      <div ref={buttonContainerRef} style={{ display: isReady ? 'block' : 'none' }}></div>
    </div>
  );
};

export default GooglePayButton;
