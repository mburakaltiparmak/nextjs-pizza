import { useState, useCallback } from "react";

/**
 * Custom hook to manage checkout stepper logic.
 * Handles step navigation, completion status, and accessibility.
 * 
 * @param {Array} stepsConfig Array of step objects (id, title, icon, etc.)
 * @param {Object} contextData Data needed to determine if steps are disabled (e.g., cart, auth)
 * @returns {Object} Stepper state and control functions
 */
export const useCheckoutStepper = (stepsConfig, contextData = {}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState({
        1: false,
        2: false,
        3: false
    });

    const totalSteps = stepsConfig.length;

    /**
     * Mark a step as complete and optionally advance to the next step
     * @param {number} stepId ID of the step to mark complete
     * @param {boolean} autoAdvance Whether to automatically go to next step
     */
    const completeStep = useCallback((stepId, autoAdvance = true) => {
        setCompletedSteps(prev => ({
            ...prev,
            [stepId]: true
        }));

        if (autoAdvance && stepId < totalSteps) {
            setCurrentStep(stepId + 1);
        }
    }, [totalSteps]);

    /**
     * Handle manual navigation to a specific step
     * Checks if the target step is accessible
     * @param {number} stepId Target step ID
     */
    const goToStep = useCallback((stepId) => {
        // Can always go back
        if (stepId < currentStep) {
            setCurrentStep(stepId);
            return;
        }

        // To go forward/jump, check requirements (simplified: previous step must be complete)
        // We generally don't allow jumping forward without completing current, 
        // but this depends on use case. Here we assume sequential.
        
        // However, for "editing" previous steps, we might want to let user go back to 3 after 2 if 2 is done.
        // Simple rule: Can go to step N if step N-1 is completed.
        const prevStepCompleted = stepId === 1 || completedSteps[stepId - 1];
        
        // Also check external disable conditions (like empty cart for step 1)
        // This logic is mostly handled in the UI/Config disabled prop, but can be enforced here.
        if (prevStepCompleted) {
             setCurrentStep(stepId);
        }
    }, [currentStep, completedSteps]);

    /**
     * Helper to check if a step is accessible
     */
    const isStepAccessible = useCallback((stepId) => {
        if (stepId === 1) return true; // Step 1 always accessible if cart not empty (handled elsewhere)
        return completedSteps[stepId - 1];
    }, [completedSteps]);

    return {
        currentStep,
        completedSteps,
        completeStep,
        goToStep,
        isStepAccessible,
        setCompletedSteps // Expose for reset or specific manual control if needed
    };
};
