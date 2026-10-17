import React from 'react';
import { OfferNotificationsCenter, OfferNotificationsCenterProps } from './OfferNotificationsCenter';

export type PriceAlertsCenterProps = OfferNotificationsCenterProps;
export const PriceAlertsCenter: React.FC<PriceAlertsCenterProps> = (props) => {
  return <OfferNotificationsCenter {...props} />;
};

export default PriceAlertsCenter;
