(async () => {
    // Get the current page URL
    const rawUrl = document.URL;
    if(!rawUrl.includes("codestepbystep.com")){
        alert("Invalid website!");
        return;
    }

    const domain = rawUrl.split("https://")[1].split("/")[0];

    // Verify that we're on a CodeStepByStep problem page
    if (!rawUrl.includes("/r/problem/view/")) {
        alert("This is not a valid CodeStepByStep problem page.");
        return;
    }

    // Parse the URL and extract the problem identifier (excluding query params)
    const urlObj = new URL(rawUrl);
    const pathname = urlObj.pathname;
    const problemSlug = pathname.split("/r/problem/view/")[1];

    try {
        // Step 1: Get the internal problem ID using the slug
        const statusRes = await fetch(`https://${domain}/api/solvedstatus/get?problemid=${encodeURIComponent(problemSlug)}`, {
            method: "GET",
            credentials: "include" // Use the existing logged-in session
        });

        // If the request fails, stop execution
        if (!statusRes.ok) throw new Error("Failed to get problem status");

        // Parse the JSON response to extract the internal problem ID
        const statusJson = await statusRes.json();
        const internalId = statusJson?.solved?.problem?.id;

        // If internal ID is missing, abort
        if (!internalId) throw new Error("Could not resolve internal problem ID.");

        // Step 2: Use the internal ID to fetch the server-provided solution(s)
        const solutionRes = await fetch(`https://${domain}/api/submission/check?problemid=${internalId}`, {
            method: "GET",
            credentials: "include"
        });

        // If the request fails, abort
        if (!solutionRes.ok) throw new Error("Failed to get solution data");

        // Parse the solution response
        const solutionJson = await solutionRes.json();
        const questions = solutionJson.questions;

        // If no questions or answers are returned, notify the user
        if (!questions?.length) {
            alert("No server-provided solutions found.");
            return;
        }

        // Format and display the answers using a popup
        let output = `Solutions for:\n${urlObj.origin + pathname}\n\n`;
        questions.forEach((q, i) => {
            output += `Question #${i + 1}:\n${q.solution}\n\n`;
        });

        alert(output.trim());

    } catch (err) {
        // Catch any errors during the process and display them
        alert("Error: " + err.message);
    }
})();
