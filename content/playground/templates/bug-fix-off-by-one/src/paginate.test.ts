import { paginate } from "./paginate"

describe("paginate", () => {
  it("returns a full page including the last item", () => {
    expect(paginate([1, 2, 3, 4, 5], 0, 3)).toEqual([1, 2, 3])
  })

  it("returns the second page correctly", () => {
    expect(paginate([1, 2, 3, 4, 5], 1, 2)).toEqual([3, 4])
  })

  it("returns an empty array when page is out of range", () => {
    expect(paginate([1, 2, 3], 5, 2)).toEqual([])
  })
})
