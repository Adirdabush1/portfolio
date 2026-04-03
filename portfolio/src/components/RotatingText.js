// src/components/RotatingText.tsx
"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useState, useCallback, useEffect, useImperativeHandle, useMemo, } from "react";
import { motion, AnimatePresence, } from "framer-motion";
import "./RotatingText.css";
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
const RotatingText = forwardRef((props, ref) => {
    const { texts, transition = { type: "spring", damping: 25, stiffness: 300 }, initial = { y: "100%", opacity: 0 }, animate = { y: 0, opacity: 1 }, exit = { y: "-120%", opacity: 0 }, animatePresenceMode = "wait", animatePresenceInitial = false, rotationInterval = 2000, staggerDuration = 0, staggerFrom = "first", loop = true, auto = true, splitBy = "characters", onNext, mainClassName, splitLevelClassName, elementLevelClassName } = props, rest = __rest(props, ["texts", "transition", "initial", "animate", "exit", "animatePresenceMode", "animatePresenceInitial", "rotationInterval", "staggerDuration", "staggerFrom", "loop", "auto", "splitBy", "onNext", "mainClassName", "splitLevelClassName", "elementLevelClassName"]);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const splitIntoCharacters = (text) => {
        if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
            const Segmenter = Intl.Segmenter;
            const segmenter = new Segmenter("en", { granularity: "grapheme" });
            return Array.from(segmenter.segment(text), (s) => s.segment);
        }
        return Array.from(text);
    };
    const elements = useMemo(() => {
        if (!texts || texts.length === 0) {
            console.warn("RotatingText: Received empty or undefined 'texts' prop.");
            return []; // מחזיר מערך ריק במקום null
        }
        const currentText = texts[currentTextIndex] || "";
        const words = currentText.split(" ");
        return words.map((word, i) => ({
            characters: splitBy === "characters" ? splitIntoCharacters(word) : [word],
            needsSpace: i !== words.length - 1,
        }));
    }, [texts, currentTextIndex, splitBy]);
    const getStaggerDelay = useCallback((index, totalChars) => {
        const total = totalChars;
        if (staggerFrom === "first")
            return index * staggerDuration;
        if (staggerFrom === "last")
            return (total - 1 - index) * staggerDuration;
        if (staggerFrom === "center") {
            const center = Math.floor(total / 2);
            return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === "random") {
            const randomIndex = Math.floor(Math.random() * total);
            return Math.abs(randomIndex - index) * staggerDuration;
        }
        return Math.abs(staggerFrom - index) * staggerDuration;
    }, [staggerFrom, staggerDuration]);
    const handleIndexChange = useCallback((newIndex) => {
        setCurrentTextIndex(newIndex);
        if (onNext)
            onNext(newIndex);
    }, [onNext]);
    const next = useCallback(() => {
        const nextIndex = currentTextIndex === texts.length - 1
            ? loop
                ? 0
                : currentTextIndex
            : currentTextIndex + 1;
        handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);
    const previous = useCallback(() => {
        const prevIndex = currentTextIndex === 0
            ? loop
                ? texts.length - 1
                : currentTextIndex
            : currentTextIndex - 1;
        handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);
    const jumpTo = useCallback((index) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        handleIndexChange(validIndex);
    }, [texts.length, handleIndexChange]);
    const reset = useCallback(() => {
        handleIndexChange(0);
    }, [handleIndexChange]);
    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);
    useEffect(() => {
        if (!auto)
            return;
        const intervalId = setInterval(next, rotationInterval);
        return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto]);
    return (_jsx(motion.span, Object.assign({ className: cn("text-rotate", mainClassName) }, rest, { transition: transition, children: _jsx(AnimatePresence, { mode: animatePresenceMode, initial: animatePresenceInitial, children: _jsx(motion.div, { className: "text-rotate-line", "aria-hidden": "true", children: elements.map((wordObj, wordIndex, array) => {
                    const previousCharsCount = array
                        .slice(0, wordIndex)
                        .reduce((sum, word) => sum + word.characters.length, 0);
                    return (_jsxs("span", { className: cn("text-rotate-word", splitLevelClassName), children: [wordObj.characters.map((char, charIndex) => (_jsx(motion.span, { initial: initial, animate: animate, exit: exit, transition: Object.assign(Object.assign({}, transition), { delay: getStaggerDelay(previousCharsCount + charIndex, array.reduce((sum, word) => sum + word.characters.length, 0)) }), className: cn("text-rotate-element", elementLevelClassName), children: char }, charIndex))), wordObj.needsSpace && _jsx("span", { className: "text-rotate-space", children: " " })] }, wordIndex));
                }) }, currentTextIndex) }) })));
});
RotatingText.displayName = "RotatingText";
export default RotatingText;
