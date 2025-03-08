import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "approximation_of_pi";
var name = "Approximation of Pi";
var description = "This theory focuses on approximating the value of pi. Will you be able to approximate more than the usual digits of pi?";
var authors = "Louie Soulen Kurenai (@paytouse on Discord)";
var version = 2;

var currency;
var piAccuracy, c1, c2;
var piExp;

var achievement1, secretAchievement1, secretAchievement2;
var chapter1, chapter2, chapter3;

var init = () => {
    currency = theory.createCurrency();

    piAccuracy = theory.createUpgrade(0, currency, new ExponentialCost(10, Math.log2(3)));
    piAccuracy.getDescription = (_) => Utils.getMath("dπ = " + (piAccuracy.level + 1));
    piAccuracy.getInfo = (amount) => Utils.getMathTo("dπ = " + (piAccuracy.level + 1), "dπ = " + (piAccuracy.level + amount + 1));

    c1 = theory.createUpgrade(1, currency, new ExponentialCost(15, Math.log2(2)));
    c1.getDescription = (_) => Utils.getMath("c_1=" + getC1(c1.level).toString(2));
    c1.getInfo = (amount) => Utils.getMathTo(getC1(c1.level).toString(2), getC1(c1.level + amount).toString(2));

    c2 = theory.createUpgrade(2, currency, new ExponentialCost(20, Math.log2(2.5)));
    c2.getDescription = (_) => Utils.getMath("c_2=" + getC2(c2.level).toString(2));
    c2.getInfo = (amount) => Utils.getMathTo(getC2(c2.level).toString(2), getC2(c2.level + amount).toString(2));

    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    theory.setMilestoneCost(new LinearCost(10, 10));

    piExp = theory.createMilestoneUpgrade(0, 3);
    piExp.description = Localization.getUpgradeIncCustomExpDesc("π Bonus", "0.05");
    piExp.info = Localization.getUpgradeIncCustomExpInfo("π Bonus", "0.05");
    piExp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();

    achievement1 = theory.createAchievement(0, "Basic Approximation", "Correctly approximate at least 3 digits of pi.", () => piAccuracy.level >= 3);
    secretAchievement1 = theory.createSecretAchievement(1, "Approximator", "Approximate the first 10 digits of pi.", "You're actually into approximating numbers, are you?", () => piAccuracy.level >= 10);
    secretAchievement2 = theory.createSecretAchievement(2, "Master of Approximation", "Approximate the 100 digits of pi.", "Oh boy...", () => piAccuracy.level >= 100);

    chapter1 = theory.createStoryChapter(0, "Prologue", "You are a young mathematician.\nYour professor tells you approximate the value of pi.\nAs you got home, you took a small research about it.\nFortunately, no one has approximated the actual value of pi.\nFor now, you are attempting to approximate the value of pi.\nWill you be able to reach the usual value?", () => piAccuracy.level >= 0);
    chapter2 = theory.createStoryChapter(1, "The Approximation Begins", "You have reached the usual value.\nBut it seemed like it's not enough.\nYou asked your professor about this.\nHe advised you to try and approximate it further.\nSo you went to your desk, and try to do what he said.", () => piAccuracy.level >= 3);
    chapter3 = theory.createStoryChapter(2, "Bizzare Numbers", "It took you a long time to approximate the value.\nYou showed the work, and your professor isn't happy.\nHe said that the numbers are too basic, and it needs more decimals.\nSo you attempt to work on it once more.", () => piAccuracy.level >= 10);

    updateAvailability();
}

var updateAvailability = () => {}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let piBonus = getPiBonus(piAccuracy.level, piExp.level);
    let c1Value = getC1(c1.level);
    let c2Value = getC2(c2.level);
    
    currency.value += dt * bonus * piBonus * c1Value * c2Value;
}

var getPiBonus = (level, exponentLevel) => {
    let digits = level + 1;
    let baseBonus = BigNumber.from(1 + Math.log10(1 + digits)).min(10);
    let exponent = BigNumber.from(1 + 0.05 * exponentLevel);
    return baseBonus.pow(exponent);
}

var getC1 = (level) => BigNumber.from(1 + 0.01 * level);
var getC2 = (level) => BigNumber.from(1 + 0.02 * level);

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = Bonus(π) \\times c_1 \\times c_2";

    if (piExp.level == 1) result += "^{1.05}";
    if (piExp.level == 2) result += "^{1.1}";
    if (piExp.level == 3) result += "^{1.15}";

    return result;
}

var getSecondaryEquation = () => {
    let rhoStr = currency.value.toString();
    return Utils.getMath("\\tau = \\max \\rho^{1.2} \\quad , \\quad \\rho = " + rhoStr);
};
var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value.pow(1.2);
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();
