export default function FormatDate(iso) {
    if (!iso)
        return ""
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}