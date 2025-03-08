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
var piAccuracy, c1, c2, c3, c4;
var c1ExpBoost, c2ExpBoost, c3Unlock, c4Unlock;
var piExp;

var achievement1, secretAchievement1, secretAchievement2;
var chapter1, chapter2, chapter3, chapter4, chapter5;

var init = () => {
    currency = theory.createCurrency();

    piAccuracy = theory.createUpgrade(0, currency, new ExponentialCost(10, Math.log2(3)));
    piAccuracy.getDescription = (_) => Utils.getMath("dπ = " + (piAccuracy.level + 1));
    piAccuracy.getInfo = (amount) => Utils.getMathTo("dπ = " + (piAccuracy.level + 1), "dπ = " + (piAccuracy.level + amount + 1));

    c1 = theory.createUpgrade(1, currency, new ExponentialCost(15, Math.log2(2)));
    c1.getDescription = (_) => Utils.getMath("c_1=1.5^{" + c1.level + "}");
    c1.getInfo = (amount) => Utils.getMathTo(getC1(c1.level).toString(2), getC1(c1.level + amount).toString(2));

    c2 = theory.createUpgrade(2, currency, new ExponentialCost(20, Math.log2(2.5)));
    c2.getDescription = (_) => Utils.getMath("c_2=1.75^{" + c2.level + "}");
    c2.getInfo = (amount) => Utils.getMathTo(getC2(c2.level).toString(2), getC2(c2.level + amount).toString(2));

    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    theory.setMilestoneCost(new LinearCost(10, 10));

    piExp = theory.createMilestoneUpgrade(0, 3);
    piExp.description = Localization.getUpgradeIncCustomExpDesc("π Bonus", "0.05");
    piExp.info = Localization.getUpgradeIncCustomExpInfo("π Bonus", "0.05");
    piExp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();

    c1ExpBoost = theory.createMilestoneUpgrade(1, 3);
    c1ExpBoost.description = Localization.getUpgradeIncCustomExpDesc("c_1 exponent", "0.05");
    c1ExpBoost.info = Localization.getUpgradeIncCustomExpInfo("c_1 exponent", "0.05");
    c1ExpBoost.boughtOrRefunded = (_) => updateAvailability();

    c2ExpBoost = theory.createMilestoneUpgrade(2, 3);
    c2ExpBoost.description = Localization.getUpgradeIncCustomExpDesc("c_2 exponent", "0.05");
    c2ExpBoost.info = Localization.getUpgradeIncCustomExpInfo("c_2 exponent", "0.05");
    c2ExpBoost.boughtOrRefunded = (_) => updateAvailability();

    c3Unlock = theory.createMilestoneUpgrade(3, 1);
    c3Unlock.description = "Unlocks c_3";
    c3Unlock.info = "Add c_3 to the formula";
    c3Unlock.boughtOrRefunded = (_) => updateAvailability();

    c4Unlock = theory.createMilestoneUpgrade(4, 1);
    c4Unlock.description = "Unlocks c_4";
    c4Unlock.info = "Add c_4 to the formula";
    c4Unlock.boughtOrRefunded = (_) => updateAvailability();

    if (c3Unlock.level > 0) {
        c3 = theory.createUpgrade(3, currency, new ExponentialCost(50, Math.log2(3)));
        c3.getDescription = (_) => Utils.getMath("c_3=" + getC3(c3.level).toString(2));
        c3.getInfo = (amount) => Utils.getMathTo(getC3(c3.level).toString(2), getC3(c3.level + amount).toString(2));
    }

    if (c4Unlock.level > 0) {
        c4 = theory.createUpgrade(4, currency, new ExponentialCost(75, Math.log2(4)));
        c4.getDescription = (_) => Utils.getMath("c_4=" + getC4(c4.level).toString(2));
        c4.getInfo = (amount) => Utils.getMathTo(getC4(c4.level).toString(2), getC4(c4.level + amount).toString(2));
    }
    
    achievement1 = theory.createAchievement(0, "Basic Approximation", "Correctly approximate at least 3 digits of pi.", () => piAccuracy.level >= 3);
    secretAchievement1 = theory.createSecretAchievement(1, "Approximator", "Approximate the first 10 digits of pi.", "You're actually into approximating numbers, are you?", () => piAccuracy.level >= 10);
    secretAchievement2 = theory.createSecretAchievement(2, "Master of Approximation", "Approximate the 100 digits of pi.", "Oh boy...", () => piAccuracy.level >= 100);

    chapter1 = theory.createStoryChapter(0, "Prologue", "You are a young mathematician.\nYour professor tells you approximate the value of pi.\nAs you got home, you took a small research about it.\nFortunately, no one has approximated the actual value of pi.\nFor now, you are attempting to approximate the value of pi.\nWill you be able to reach the usual value?", () => piAccuracy.level >= 0);
    chapter2 = theory.createStoryChapter(1, "The Approximation Begins", "You have reached the usual value.\nBut it seemed like it's not enough.\nYou asked your professor about this.\nHe advised you to try and approximate it further.\nSo you went to your desk, and try to do what he said.", () => piAccuracy.level >= 3);
    chapter3 = theory.createStoryChapter(2, "Bizzare Numbers", "It took you a long time to approximate the value.\nYou showed the work, and your professor isn't happy.\nHe said that the numbers are too basic, and it needs more decimals.\nSo you attempt to work on it once more.", () => piAccuracy.level >= 10);
    chapter4 = theory.createStoryChapter(3, "Approximating Further", "After some time, you managed to approximate the value of pi.\nIt felt like you are the only one who has done it.\nOnce again, you showed the work to your professor.\nHe was shocked to see the 25 digits of pi.\nHe feels so proud of you, and he advises you to keep the approximation up.\nYou took the advise, and got to focusing on approximating this value much further.", () => piAccuracy.level >= 25);
    chapter5 = theory.createStoryChapter(4, "More Digits!", "As you keep approximating, you find this job so easy.\nBut it's not as easy as you could think.\nAs you progress, the approximation gets harder.\nIt felt like the value of pi is just endless.\nInstead of attempting to approximate this further, you make a program that attempts to do the job for you.", () => piAccuracy.level >= 50);

    updateAvailability();
}

var updateAvailability = () => {
    let canUnlockC3 = c1ExpBoost.level === 3 && c2ExpBoost.level === 3;
    
    c3Unlock.isAvailable = canUnlockC3;
    c4Unlock.isAvailable = c3Unlock.level === 1;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let piBonus = getPiBonus(piAccuracy.level, piExp.level);
    let piAccCont = piAccuracy.level * Math.PI;
    let c1Value = getC1(c1.level);
    let c2Value = getC2(c2.level);
    let c3Value = c3Unlock.level > 0 ? getC3(c3.level) : BigNumber.ONE;
    let c4Value = c4Unlock.level > 0 ? getC4(c4.level) : BigNumber.ONE;

    currency.value += piAccCont * dt * bonus * piBonus * c1Value * c2Value * c3Value * c4Value;
}

var getPiBonus = (level, exponentLevel) => {
    let digits = level + 1;
    let baseBonus = BigNumber.from(1 + Math.log10(1 + digits)).min(25);
    let exponent = BigNumber.from(1 + 0.05 * exponentLevel);
    return baseBonus.pow(exponent);
}

var getC1 = (level) => BigNumber.from(1.50).pow(level);
var getC2 = (level) => BigNumber.from(1.75).pow(level);
var getC3 = (level) => BigNumber.from(2).pow(level);
var getC4 = (level) => BigNumber.from(2.5).pow(level);

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = Bonus(π) \\times c_1 \\times c_2";

    if (piExp.level == 1) result += "^{1.05}";
    if (piExp.level == 2) result += "^{1.1}";
    if (piExp.level == 3) result += "^{1.15}";

    return result;
}

var getSecondaryEquation = () => {
    return theory.latexSymbol + "=\\max\\rho^{1.2}";
};
var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value.pow(1.2);
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();
