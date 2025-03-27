import { useState } from "react";

export default function DragDropBuilder() {
    const [workflow, setWorkflow] = useState([]);

    function addStep(type) {
        setWorkflow([...workflow, { type, id: Date.now() }]);
    }

    return (
        <div className="p-5 border rounded">
            <h2 className="text-xl">AI Workflow Builder</h2>
            <div className="space-x-2">
                <button onClick={() => addStep("Input")} className="p-2 bg-gray-200">+ Input</button>
                <button onClick={() => addStep("LLM Call")} className="p-2 bg-gray-200">+ AI Response</button>
            </div>
            <div className="mt-3">
                {workflow.map((step) => (
                    <div key={step.id} className="p-3 border mt-2">{step.type}</div>
                ))}
            </div>
        </div>
    );
}
