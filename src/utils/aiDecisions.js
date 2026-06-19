/**
 * Analyzes a product suite and its products to generate a customized, 
 * data-driven Next Best Decision targeting Monthly Recurring Revenue (MRR) growth.
 */
export function generateNextBestDecision(suite, products) {
  if (!products || products.length === 0) {
    return {
      recommendation: "Add products to this suite in the Admin Panel to begin recommendation analysis.",
      shortRecommendation: "Add products to start recommendation analysis.",
      impact: "$0 / month",
      confidence: "0%"
    };
  }

  // Calculate metrics
  const analyzedProducts = products.map(p => {
    const currentVolume = p.weeklyVolume;
    const prevWeekVolume = p.lastWeekVolume;
    const price = p.price;
    const target = p.targetSales;

    const currentMrr = currentVolume * price;
    const weekGrowth = prevWeekVolume > 0 ? ((currentVolume - prevWeekVolume) / prevWeekVolume) * 100 : 0;
    
    // 12-month growth calculation (history length is 13, so history[12] is current, history[0] is 1 year ago)
    const history = p.history || [];
    const currentMonthVol = history[history.length - 1]?.volume || currentVolume;
    const yearAgoMonthVol = history[0]?.volume || currentMonthVol;
    const yearGrowth = yearAgoMonthVol > 0 ? ((currentMonthVol - yearAgoMonthVol) / yearAgoMonthVol) * 100 : 0;
    
    const pctOfTarget = target > 0 ? (currentVolume / target) * 100 : 100;

    return {
      ...p,
      currentMrr,
      weekGrowth,
      yearGrowth,
      pctOfTarget,
      currentVolume
    };
  });

  // Find products by tier
  const goodProduct = analyzedProducts.find(p => p.tier === 'good');
  const betterProduct = analyzedProducts.find(p => p.tier === 'better');
  const bestProduct = analyzedProducts.find(p => p.tier === 'best');

  // Logic 1: Underperforming product (declining growth)
  const decliningProduct = analyzedProducts.find(p => p.weekGrowth < -2);
  if (decliningProduct) {
    const pctDrop = Math.abs(decliningProduct.weekGrowth).toFixed(1);
    const suggestedDiscountPrice = Math.round(decliningProduct.price * 0.85);
    const estimatedRecapture = Math.round(decliningProduct.price * (decliningProduct.targetSales - decliningProduct.currentVolume) * 0.4);

    return {
      recommendation: `<strong>Optimize Retention for ${decliningProduct.name}:</strong> The volume has declined by <strong>${pctDrop}%</strong> over the past week. To reverse this churn and protect recurring revenue, run a <strong>re-engagement campaign</strong> offering a loyalty discount of 15% (new monthly price of <strong>$${suggestedDiscountPrice}</strong>) to users threatening to cancel. Additionally, review integration logs for user experience friction.`,
      shortRecommendation: `Optimize retention pricing for ${decliningProduct.name} (15% loyalty discount) to prevent subscription cancellations.`,
      impact: `+$${estimatedRecapture.toLocaleString()} / mo (retrieved)`,
      confidence: "84%",
      focusProduct: decliningProduct.name,
      actionType: "Retention & Loyalty Pricing"
    };
  }

  // Logic 2: Good product is booming (exceeding target), recommend price increase or upsell
  if (goodProduct && goodProduct.pctOfTarget > 85 && goodProduct.weekGrowth > 3) {
    const suggestedPriceInc = Math.round(goodProduct.price * 1.1);
    const priceDiff = suggestedPriceInc - goodProduct.price;
    const projectedChurn = 0.05; // 5% churn assumption
    const newVol = Math.round(goodProduct.currentVolume * (1 - projectedChurn));
    const currentMrr = goodProduct.currentVolume * goodProduct.price;
    const projectedMrr = newVol * suggestedPriceInc;
    const mrrGain = Math.round(projectedMrr - currentMrr);

    return {
      recommendation: `<strong>Execute Selective Price Optimization:</strong> <strong>${goodProduct.name}</strong> (Good tier) is performing strongly, achieving <strong>${goodProduct.pctOfTarget.toFixed(0)}%</strong> of its target sales volume and showing <strong>${goodProduct.weekGrowth.toFixed(1)}%</strong> week-over-week growth. Since low-tier cybersecurity core services have high price-inelasticity, consider a modest price adjustment from <strong>$${goodProduct.price}</strong> to <strong>$${suggestedPriceInc}</strong>. Even with an estimated 5% friction-based churn, this optimization will boost suite MRR.`,
      shortRecommendation: `Adjust entry price for ${goodProduct.name} from $${goodProduct.price} to $${suggestedPriceInc} based on high volume inelasticity.`,
      focusProduct: goodProduct.name,
      impact: `+$${mrrGain.toLocaleString()} / mo`,
      confidence: "90%",
      actionType: "Price Adjustment"
    };
  }

  // Logic 3: Massive gap between Good/Better volume, recommend upgrade campaign
  if (goodProduct && betterProduct && goodProduct.currentVolume > betterProduct.currentVolume * 2.2) {
    const upsellRate = 0.08; // 8% conversion rate
    const upsellCount = Math.round(goodProduct.currentVolume * upsellRate);
    const priceDiff = betterProduct.price - goodProduct.price;
    const mrrGain = Math.round(upsellCount * priceDiff);

    return {
      recommendation: `<strong>Launch Tier-Migration Campaign:</strong> Your <strong>${goodProduct.name}</strong> customer base is <strong>${(goodProduct.currentVolume / betterProduct.currentVolume).toFixed(1)}x</strong> larger than <strong>${betterProduct.name}</strong>. Target the top 15% most active users of the 'Good' tier with a limited-time upgrade promotion: upgrade to the 'Better' tier (<strong>${betterProduct.name}</strong>) and receive a locked-in rate of <strong>$${Math.round(betterProduct.price * 0.9)}/mo</strong> for the first year. Converting just 8% of these accounts will significantly expand your margins.`,
      shortRecommendation: `Launch upgrade promo to migrate mature ${goodProduct.name} users to ${betterProduct.name}.`,
      focusProduct: betterProduct.name,
      impact: `+$${mrrGain.toLocaleString()} / mo`,
      confidence: "78%",
      actionType: "Upsell & Bundling"
    };
  }

  // Logic 4: Better tier performing well, push to Best tier
  if (betterProduct && bestProduct && betterProduct.weekGrowth > 2) {
    const upsellRate = 0.05; // 5% conversion rate
    const upsellCount = Math.round(betterProduct.currentVolume * upsellRate);
    const priceDiff = bestProduct.price - betterProduct.price;
    const mrrGain = Math.round(upsellCount * priceDiff);

    return {
      recommendation: `<strong>Enterprise Upsell Push:</strong> <strong>${betterProduct.name}</strong> is showing consistent momentum (<strong>${betterProduct.weekGrowth.toFixed(1)}%</strong> growth this week). Initiate a direct outreach sales campaign targeting companies subscribing to ${betterProduct.name} for more than 6 months, promoting the advanced features of <strong>${bestProduct.name}</strong> (e.g. dedicated response SLAs, threat hunting). A 5% upgrade conversion rate yields a major MRR expansion.`,
      shortRecommendation: `Upsell mature ${betterProduct.name} accounts to high-tier ${bestProduct.name} features.`,
      focusProduct: bestProduct.name,
      impact: `+$${mrrGain.toLocaleString()} / mo`,
      confidence: "72%",
      actionType: "Enterprise Upsell"
    };
  }

  // Default Fallback decision
  const highestVolumeProduct = analyzedProducts.reduce((prev, current) => (prev.currentMrr > current.currentMrr) ? prev : current, analyzedProducts[0]);
  const increaseRate = Math.round(highestVolumeProduct.price * 1.05);
  const potentialGain = Math.round(highestVolumeProduct.currentVolume * (increaseRate - highestVolumeProduct.price));

  return {
    recommendation: `<strong>Initiate Price-Elasticity Pilot:</strong> <strong>${highestVolumeProduct.name}</strong> represents your largest revenue driver in this suite. To increase MRR, test a minor 5% price increase (to <strong>$${increaseRate}</strong>) for new signups while grandfathering existing clients. Monitor conversion rates for 14 days to calculate elasticity before rolling out globally.`,
    shortRecommendation: `Test 5% price elasticity pilot for new signups on ${highestVolumeProduct.name}.`,
    focusProduct: highestVolumeProduct.name,
    impact: `+$${potentialGain.toLocaleString()} / mo`,
    confidence: "65%",
    actionType: "Elasticity Testing"
  };
}
