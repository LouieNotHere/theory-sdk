import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "pi_approximation_theory";
var name = "Pi Approximation";
var description = "The more digits of π you approximate correctly, the more ρ you generate!";
var authors = "Custom by User";
var version = 1;

var currency;
var piAccuracy;
var piExp;

var achievement1, achievement2;
var chapter1, chapter2;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // piAccuracy - Improves π approximation
    {
        let getDesc = (level) => "π Digits: " + (level + 1);
        let getInfo = (level) => "Correct Digits: " + (level + 1);
        piAccuracy = theory.createUpgrade(0, currency, new ExponentialCost(10, Math.log2(3)));
        piAccuracy.getDescription = (_) => Utils.getMath(getDesc(piAccuracy.level));
        piAccuracy.getInfo = (amount) => Utils.getMathTo(getInfo(piAccuracy.level), getInfo(piAccuracy.level + amount));
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(10, 10));

    {
        piExp = theory.createMilestoneUpgrade(0, 3);
        piExp.description = Localization.getUpgradeIncCustomExpDesc("π Bonus", "0.05");
        piExp.info = Localization.getUpgradeIncCustomExpInfo("π Bonus", "0.05");
        piExp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }
    
    /////////////////
    //// Achievements
    achievement1 = theory.createAchievement(0, "First Digits", "Correctly approximate at least 3 digits of π.", () => piAccuracy.level >= 3);
    achievement2 = theory.createSecretAchievement(1, "Mathematician", "Reach 10 correct digits of π!", "You're really into numbers!", () => piAccuracy.level >= 10);

    ///////////////////
    //// Story chapters
    chapter1 = theory.createStoryChapter(0, "Pi Begins", "You start approximating π. A simple 3.1 isn't enough!", () => piAccuracy.level > 0);
    chapter2 = theory.createStoryChapter(1, "A True Mathematician", "With enough digits, you become an expert in π.", () => piAccuracy.level > 5);

    updateAvailability();
}

var updateAvailability = () => {}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let piBonus = getPiBonus(piAccuracy.level, piExp.level);
    
    currency.value += dt * bonus * piBonus;
}

// Calculates the π bonus (caps at 10x)
var getPiBonus = (level, exponentLevel) => {
    let digits = level + 1;
    let baseBonus = BigNumber.from(1 + Math.log10(1 + digits)).min(10);
    let exponent = BigNumber.from(1 + 0.05 * exponentLevel);
    return baseBonus.pow(exponent);
}

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = Bonus(π)";

    if (piExp.level == 1) result += "^{1.05}";
    if (piExp.level == 2) result += "^{1.1}";
    if (piExp.level == 3) result += "^{1.15}";

    return result;
}

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho";
var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value;
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();
