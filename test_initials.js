
function getInitials(user) {
    if (!user) return "U";

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    const fullName = user.name || (firstName || lastName ? `${firstName} ${lastName}`.trim() : "");
    
    const nameToUse = fullName || user.email || "User";
    const parts = nameToUse.split(' ');

    const filteredParts = parts.filter(p => !!p);

    if (filteredParts.length >= 2) {
        return `${filteredParts[0][0]}${filteredParts[1][0]}`.toUpperCase();
    }

    const capitals = nameToUse.match(/[A-Z]/g);
    if (capitals && capitals.length >= 2) {
        const caps = capitals.slice(0, 2).join('').toUpperCase();
        return caps;
    }

    return nameToUse.slice(0, 2).toUpperCase();
}

const testCases = [
    { user: { first_name: "AbdulHameed", last_name: "" }, expected: "AH" },
    { user: { first_name: "AbdulHameed", last_name: "Lastname" }, expected: "AL" },
    { user: { first_name: "Abdul", last_name: "Hameed" }, expected: "AH" },
    { user: { first_name: "abdulhameed", last_name: "" }, expected: "AB" },
    { user: { name: "AbdulHameed" }, expected: "AH" },
    { user: { email: "AbdulHameed@example.com" }, expected: "AH" },
    { user: { email: "abdulhameed@example.com" }, expected: "AB" }
];

testCases.forEach(tc => {
    const result = getInitials(tc.user);
    const pass = result === tc.expected;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] User: ${JSON.stringify(tc.user)} | Result: ${result} | Expected: ${tc.expected}`);
});
