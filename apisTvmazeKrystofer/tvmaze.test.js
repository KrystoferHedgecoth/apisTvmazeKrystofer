"use strict";

// These tests are like "unit tests" but they make real web requests because we're not using fake data.

describe("searchShowsByQuery", function () {
 it("should successfully retrieve shows", async function () {
    const shows = await getShowsByTerm("House");
    const ids = shows.map(s => s.id);
    expect(ids).toEqual([118, 23583, 68664, 56469, 1251, 67139, 4987, 58961, 3081, 44386]);
 });

 it("should return an empty array for non-existent shows", async function () {
    const shows = await getShowsByTerm("squeamish ossifrage");
    expect(shows).toEqual([]);
 });
});

describe("fetchEpisodesForShow", function () {

 it("should successfully fetch episodes", async function () {
    const episodes = await getEpisodesOfShow(118);
    expect(episodes.length).toEqual(176);
 });

 it("should gracefully handle non-existent shows", async function () {
    try {
      const episodes = await getEpisodesOfShow(0);
    } catch (err) {
      expect(err.message).toContain("404");
    }
 });
});

// This test is a genuine unit test, since we mock axios to isolate the function.

describe("fetchEpisodesForShow [mocked]", function () {

 it("should successfully fetch episodes", async function () {
    const mock = new AxiosMockAdapter(axios);
    mock.onGet(`${TVMAZE_API_URL}shows/1000/episodes`)
      .reply(200, [{ id: 1, name: "A", season: "B", number: 10 }]);

    const episodes = await getEpisodesOfShow(1000);
    expect(episodes).toEqual([{
      id: 1,
      name: "A",
      season: "B",
      number: 10,
    }]);

    // Revert axios to its original state
    mock.restore();
 });
});

// This tests the UI interaction.

describe("submitSearchForm", function () {

 it("should trigger search", async function () {
    // Verify if the search function is invoked upon form submission
    spyOn(window, "searchForShowAndDisplay");

    // Simulate a form submission
    $("#searchForm-term").val("House");
    $searchForm.trigger("submit");

    // Ensures the search function was called
    expect(searchForShowAndDisplay).toHaveBeenCalledTimes(1);
 });
})